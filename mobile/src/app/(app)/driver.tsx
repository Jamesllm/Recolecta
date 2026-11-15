// Perfil del conductor · «Mi ruta»: paradas en orden, GPS en vivo para la central y «Recogido» en cada parada
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Redirect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeafletMap, type LatLng, type LeafletMapHandle, type MapStop } from '@/components/LeafletMap';
import { Banner, Button } from '@/components/ui';
import { api, ApiError, type DriverRoute, type DriverStop } from '@/lib/api';
import { formatDistance } from '@/lib/location';
import { useSession } from '@/lib/session';
import { colors, radius } from '@/lib/theme';

const SEND_EVERY_MS = 5000; // cada cuánto se envía la ubicación a la central
const REFRESH_MS = 10000; // cada cuánto se actualiza la ruta (avance y paradas)
const NEAR_STOP_M = 60; // a esta distancia se ofrece «Recogido» sin preguntar

/** Distancia en metros entre dos puntos (haversine) */
const metersBetween = (a: LatLng, b: LatLng) => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

const km = (m: number) => `${(m / 1000).toFixed(1).replace('.', ',')} km`;

/** Confirmación que funciona en el teléfono y en la versión web */
const confirmAction = (title: string, message: string, accept: string, onAccept: () => void) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onAccept();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: accept, onPress: onAccept },
  ]);
};

type Tracking = { state: 'off' } | { state: 'asking' } | { state: 'denied' } | { state: 'on'; lastSent: number | null; error: string | null };

export default function DriverScreen() {
  const { user, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<LeafletMapHandle>(null);
  const [route, setRoute] = useState<DriverRoute | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // acción en curso: 'start', 'finish' o el id de la parada
  const [refreshing, setRefreshing] = useState(false);
  const [me, setMe] = useState<(LatLng & { accuracy: number | null }) | null>(null);
  const [tracking, setTracking] = useState<Tracking>({ state: 'off' });
  const [center, setCenter] = useState<LatLng | null>(null);
  const [, setTick] = useState(0); // refresca «hace N s»

  const trip = route?.trip ?? null;
  const active = !!trip && trip.state !== 'done' && route?.truck?.status === 'on_route';
  const started = active && trip.source === 'gps';

  const load = useCallback(async () => {
    try {
      const res = await api.driverRoute();
      setRoute(res.data);
      setError(null);
      const t = res.data.trip;
      if (t) setCenter((c) => c ?? { latitude: t.next_stop?.latitude ?? t.origin.latitude, longitude: t.next_stop?.longitude ?? t.origin.longitude });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu ruta.');
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // GPS en vivo: solo mientras la ruta está iniciada. Se apaga al terminar o al salir de la pantalla.
  useEffect(() => {
    if (!started) {
      setTracking({ state: 'off' });
      return;
    }
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    let lastSent = 0;
    (async () => {
      setTracking({ state: 'asking' });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setTracking({ state: 'denied' });
        return;
      }
      setTracking({ state: 'on', lastSent: null, error: null });
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: SEND_EVERY_MS, distanceInterval: 5 },
        async (pos) => {
          const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy ?? null };
          setMe(p);
          if (Date.now() - lastSent < SEND_EVERY_MS - 500) return;
          lastSent = Date.now();
          try {
            await api.driverPosition({ ...p, speed: pos.coords.speed, heading: pos.coords.heading });
            setTracking({ state: 'on', lastSent: Date.now(), error: null });
          } catch (e) {
            setTracking({ state: 'on', lastSent: null, error: e instanceof ApiError ? e.message : 'No se pudo enviar tu ubicación.' });
          }
        }
      );
      if (cancelled) sub.remove();
    })();
    const clock = setInterval(() => setTick((n) => n + 1), 5000);
    return () => {
      cancelled = true;
      sub?.remove();
      clearInterval(clock);
    };
  }, [started]);

  const run = async (key: string, action: () => Promise<{ message: string; data: DriverRoute }>) => {
    setBusy(key);
    setError(null);
    try {
      const res = await action();
      setRoute(res.data);
      setNotice(res.message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar la acción.');
    } finally {
      setBusy(null);
    }
  };

  const start = () =>
    confirmAction('Iniciar ruta', 'Tu ubicación se compartirá con la central mientras la ruta esté activa. Mantén la app abierta durante el recorrido.', 'Iniciar', () =>
      run('start', api.driverStart)
    );

  const collect = (stop: DriverStop) => {
    const go = () => run(String(stop.id), () => api.driverCollect(stop.id));
    const away = me ? metersBetween(me, stop) : null;
    if (away != null && away <= NEAR_STOP_M) return go();
    confirmAction(
      `¿Recogiste la parada ${stop.order}?`,
      away != null ? `Estás a ${formatDistance(away)} de #${stop.code}. Márcala solo si ya recogiste los residuos.` : `Aún no tenemos tu ubicación. Marca #${stop.code} solo si ya recogiste los residuos.`,
      'Sí, recogido',
      go
    );
  };

  const finish = () => {
    const left = trip ? trip.stops.filter((s) => s.state === 'pending').length : 0;
    confirmAction(
      'Terminar ruta',
      left ? `Quedan ${left} ${left === 1 ? 'parada' : 'paradas'} sin recoger. El gestor las verá en el panel.` : 'Recogiste todas las paradas. Tu ubicación deja de compartirse.',
      'Terminar',
      () => run('finish', api.driverFinish)
    );
  };

  const confirmSignOut = () => confirmAction('Cerrar sesión', '¿Quieres cerrar tu sesión en este teléfono?', 'Cerrar sesión', signOut);

  const openNavigation = (p: LatLng) =>
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}&travelmode=driving`).catch(() => undefined);

  const mapStops: MapStop[] = useMemo(
    () =>
      (trip?.stops ?? []).map((s) => ({
        id: s.id,
        order: s.order,
        latitude: s.latitude,
        longitude: s.longitude,
        state: s.state === 'pending' ? (s.id === trip?.next_stop?.id ? 'next' : 'pending') : s.state,
      })),
    [trip]
  );
  const mapRoute = useMemo(() => (trip && trip.state !== 'done' ? { traveled: trip.traveled, remaining: trip.remaining } : null), [trip]);
  const meOnMap = useMemo(() => (me ? { latitude: me.latitude, longitude: me.longitude } : null), [me]);

  if (user && user.role !== 'driver') return <Redirect href="/" />;

  const nextStop = trip?.stops.find((s) => s.id === trip.next_stop?.id) ?? null;
  const nextAway = me && nextStop ? metersBetween(me, nextStop) : null;
  const pct = trip && trip.length_m ? Math.min(100, Math.round((trip.progress_m / trip.length_m) * 100)) : 0;

  return (
    <View style={s.screen}>
      {/* Mapa con la ruta, las paradas y tu posición */}
      <View style={s.mapBox}>
        {center ? (
          <LeafletMap ref={mapRef} initialCenter={center} initialZoom={15} route={mapRoute} stops={mapStops} user={meOnMap} style={StyleSheet.absoluteFill} onMarkerPress={(id) => {
            const st = trip?.stops.find((x) => x.id === id);
            if (st) setNotice(`Parada ${st.order} · #${st.code} · ${st.category}${st.address ? ` · ${st.address}` : ''}`);
          }} />
        ) : (
          <View style={[StyleSheet.absoluteFill, s.mapEmpty]}>
            <Ionicons name="map-outline" size={40} color={colors.muted} />
          </View>
        )}
        <View style={[s.topBar, { top: insets.top + 10 }]}>
          <View style={s.truckChip}>
            <Ionicons name="bus" size={18} color={colors.primaryDark} />
            <Text style={s.truckChipText}>{route?.truck ? route.truck.plate : 'Mi ruta'}</Text>
            {route?.truck?.cluster_code && <Text style={s.truckChipZone}>· {route.truck.cluster_code}</Text>}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={confirmSignOut} style={s.roundBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>
        {me && (
          <Pressable accessibilityRole="button" accessibilityLabel="Centrar el mapa en mi ubicación" onPress={() => mapRef.current?.flyTo(me, 17)} style={[s.roundBtn, s.locateBtn]}>
            <Ionicons name="locate" size={20} color={colors.info} />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={s.sheet}
        contentContainerStyle={[s.sheetContent, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Text style={s.hello}>Hola, {user?.full_name.split(' ')[0] ?? 'conductor'}</Text>
        {error && <Banner tone="danger" text={error} />}
        {notice && (
          <Pressable onPress={() => setNotice(null)}>
            <Banner text={notice} />
          </Pressable>
        )}

        {!route && !error && <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />}

        {route && !route.truck && (
          <View style={s.empty}>
            <Ionicons name="link-outline" size={32} color={colors.muted} />
            <Text style={s.emptyTitle}>Tu cuenta aún no tiene camión</Text>
            <Text style={s.emptyText}>Pide al gestor de la flota que te enlace a un camión desde el panel municipal.</Text>
          </View>
        )}

        {route?.truck && !active && (
          <View style={s.empty}>
            <Ionicons name={trip?.state === 'done' ? 'checkmark-circle-outline' : 'time-outline'} size={34} color={trip?.state === 'done' ? colors.primary : colors.muted} />
            <Text style={s.emptyTitle}>{trip?.state === 'done' ? 'Ruta terminada' : 'Sin ruta asignada'}</Text>
            <Text style={s.emptyText}>
              {trip?.state === 'done'
                ? `Recogiste ${trip.stops_collected} de ${trip.stops_total} paradas. Cuando la central te asigne otra zona, aparecerá aquí.`
                : 'Cuando la central asigne tu camión a una zona, verás aquí las paradas en orden y podrás iniciar la ruta.'}
            </Text>
            <Button title="Actualizar" variant="secondary" icon="refresh" onPress={load} style={{ alignSelf: 'stretch' }} />
          </View>
        )}

        {active && trip && (
          <>
            {/* Resumen y avance */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Zona {route?.truck?.cluster_code}{route?.truck?.zone ? ` · ${route.truck.zone.split('·')[0].trim()}` : ''}</Text>
              <View style={s.bar}><View style={[s.barFill, { width: `${pct}%` }]} /></View>
              <Text style={s.meta}>{trip.stops_collected}/{trip.stops_total} paradas · {km(trip.progress_m)} de {km(trip.length_m)} · sale de {trip.origin.label}</Text>
              {started && <TrackingLine tracking={tracking} accuracy={me?.accuracy ?? null} />}
              {started && trip.off_route_m > 0 && <Banner tone="warning" text={`Estás a ${formatDistance(trip.off_route_m)} de la ruta. Vuelve al recorrido azul para que el avance se registre.`} />}
            </View>

            {!started ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>Lista para salir</Text>
                <Text style={s.meta}>Al iniciar, la central verá tu camión en el mapa con tu ubicación real. Mantén la app abierta durante el recorrido.</Text>
                <Button title="Iniciar ruta" icon="navigate" onPress={start} loading={busy === 'start'} />
              </View>
            ) : nextStop ? (
              /* Próxima parada */
              <View style={[s.card, s.nextCard]}>
                <Text style={s.overline}>Próxima parada · {nextStop.order} de {trip.stops_total}</Text>
                <Text style={s.nextTitle}>#{nextStop.code} · {nextStop.category}</Text>
                {nextStop.address && <Text style={s.meta}>{nextStop.address}</Text>}
                {nextAway != null && <Text style={s.away}>{nextAway <= NEAR_STOP_M ? 'Estás en la parada' : `A ${formatDistance(nextAway)}`}</Text>}
                <View style={s.row}>
                  <Button title="Cómo llegar" variant="secondary" icon="navigate-outline" onPress={() => openNavigation(nextStop)} style={{ flex: 1 }} />
                  <Button title="Recogido" icon="checkmark" onPress={() => collect(nextStop)} loading={busy === String(nextStop.id)} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <View style={s.card}>
                <Text style={s.cardTitle}>¡Todas las paradas atendidas!</Text>
                <Text style={s.meta}>Termina la ruta para que el camión quede disponible.</Text>
              </View>
            )}

            {/* Todas las paradas */}
            <Text style={s.section}>Paradas</Text>
            {trip.stops.map((st) => (
              // La fila no es un botón: dentro hay dos botones hermanos (ver en el mapa y «Recogido»)
              <View key={st.id} style={s.stopRow}>
                <Pressable onPress={() => mapRef.current?.flyTo(st, 17)} style={s.stopMain} accessibilityRole="button" accessibilityLabel={`Ver la parada ${st.order} en el mapa`}>
                <View style={[s.stopNum, st.state === 'collected' && s.stopDone, st.id === trip.next_stop?.id && s.stopNext, st.state === 'skipped' && { opacity: 0.45 }]}>
                  {st.state === 'collected' ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={[s.stopNumText, st.id === trip.next_stop?.id && { color: '#fff' }]}>{st.order}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stopTitle}>#{st.code} · {st.category}</Text>
                  <Text style={s.stopMeta} numberOfLines={1}>
                    {st.state === 'collected' ? 'Recogida' : st.state === 'skipped' ? 'Saltada: ya no estaba abierta' : st.address ?? 'Pendiente'}
                  </Text>
                </View>
                </Pressable>
                {started && st.state === 'pending' && st.id !== trip.next_stop?.id && (
                  <Pressable onPress={() => collect(st)} style={s.smallBtn} accessibilityRole="button" accessibilityLabel={`Marcar la parada ${st.order} como recogida`}>
                    {busy === String(st.id) ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={s.smallBtnText}>Recogido</Text>}
                  </Pressable>
                )}
              </View>
            ))}

            {started && <Button title="Terminar ruta" variant="secondary" icon="flag-outline" onPress={finish} loading={busy === 'finish'} style={{ marginTop: 8 }} />}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function TrackingLine({ tracking, accuracy }: { tracking: Tracking; accuracy: number | null }) {
  if (tracking.state === 'denied') {
    return <Banner tone="danger" text="Sin permiso de ubicación: la central no puede ver tu camión. Actívalo en los ajustes del teléfono." />;
  }
  if (tracking.state === 'asking' || tracking.state === 'off') return <Text style={s.meta}>Activando GPS…</Text>;
  if (tracking.error) return <Banner tone="warning" text={tracking.error} />;
  const ago = tracking.lastSent ? Math.max(0, Math.round((Date.now() - tracking.lastSent) / 1000)) : null;
  return (
    <View style={s.trackRow}>
      <View style={[s.dot, { backgroundColor: ago != null && ago < 30 ? colors.primary : colors.warning }]} />
      <Text style={s.trackText}>
        {ago == null ? 'Buscando señal GPS…' : `Compartiendo ubicación · hace ${ago} s`}
        {accuracy != null ? ` · ±${Math.round(accuracy)} m` : ''}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  mapBox: { height: '46%', backgroundColor: '#eef2f0' },
  mapEmpty: { alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  truckChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, paddingHorizontal: 14, height: 42, borderRadius: radius.pill, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  truckChipText: { fontWeight: '800', fontSize: 15, color: colors.ink },
  truckChipZone: { fontWeight: '600', color: colors.muted },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  locateBtn: { position: 'absolute', right: 14, bottom: 30 },
  sheet: { flex: 1, marginTop: -18, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.background },
  sheetContent: { padding: 18, gap: 12 },
  hello: { fontSize: 22, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  nextCard: { borderColor: '#BFDBFE', backgroundColor: '#F8FBFF' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  overline: { fontSize: 12, fontWeight: '700', color: colors.info, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  away: { fontSize: 14, fontWeight: '700', color: colors.info },
  meta: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#1D4ED8', borderRadius: 4 },
  row: { flexDirection: 'row', gap: 10 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  trackText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  stopMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stopNum: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stopNext: { backgroundColor: '#1D4ED8' },
  stopDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stopNumText: { fontSize: 12, fontWeight: '800', color: '#1D4ED8' },
  stopTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  stopMeta: { fontSize: 12, color: colors.muted },
  smallBtn: { paddingHorizontal: 12, height: 34, borderRadius: radius.pill, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  empty: { alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 22, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.text, textAlign: 'center', lineHeight: 20 },
});
