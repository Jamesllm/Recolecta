// Pantallas 07 · Inicio (mapa) y 08 · Detalle de punto (US-03)
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeafletMap, type LeafletMapHandle } from '@/components/LeafletMap';
import { Banner, Button, StatusPill } from '@/components/ui';
import { api, ApiError, SIZE_LABEL, type Report, type ReportStatus } from '@/lib/api';
import { currentPosition, ensureLocationPermission, formatDate, formatDistance } from '@/lib/location';
import { useSession } from '@/lib/session';
import { colors, radius, statusColor } from '@/lib/theme';

const RADIUS_M = 500;
const FILTERS: { label: string; value?: ReportStatus }[] = [
  { label: 'Todos' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'En ruta', value: 'assigned' },
  { label: 'Resueltos', value: 'resolved' },
];

type Point = { latitude: number; longitude: number };

// Distancia aproximada en metros entre dos puntos cercanos
const metersBetween = (a: Point, b: Point) => {
  const k = 111_320;
  const dx = (a.longitude - b.longitude) * k * Math.cos((a.latitude * Math.PI) / 180);
  const dy = (a.latitude - b.latitude) * k;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const mapRef = useRef<LeafletMapHandle>(null);
  const [me, setMe] = useState<Point | null>(null);
  const [center, setCenter] = useState<Point | null>(null); // centro de la búsqueda de 500 m
  const [viewCenter, setViewCenter] = useState<Point | null>(null);
  const [filter, setFilter] = useState<ReportStatus | undefined>();
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (at: Point, status?: ReportStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.nearby(at.latitude, at.longitude, RADIUS_M, status);
      setReports(res.data);
      setSelected((cur) => (cur ? res.data.find((r) => r.id === cur.id) ?? null : null));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const locate = useCallback(async (status?: ReportStatus) => {
    setLoading(true);
    setError(null);
    if (!(await ensureLocationPermission())) {
      setLoading(false);
      setError('Activa el permiso de ubicación para ver los reportes cercanos a ti.');
      return;
    }
    try {
      const pos = await currentPosition();
      const p = { latitude: pos.latitude, longitude: pos.longitude };
      setMe(p);
      setCenter(p);
      mapRef.current?.flyTo(p, 16);
      await load(p, status);
    } catch {
      setLoading(false);
      setError('No se pudo obtener tu ubicación. Verifica que el GPS esté encendido.');
    }
  }, [load]);

  // Al volver a esta pestaña (por ejemplo, después de enviar un reporte) se actualiza el mapa
  useFocusEffect(useCallback(() => {
    if (center) load(center, filter);
    else locate(filter);
  }, []));

  const changeFilter = (value?: ReportStatus) => {
    setFilter(value);
    if (center) load(center, value);
  };

  const searchHere = () => {
    if (!viewCenter) return;
    setCenter(viewCenter);
    load(viewCenter, filter);
  };

  const movedAway = !!(viewCenter && center && metersBetween(viewCenter, center) > 150);

  return (
    <View style={{ flex: 1 }}>
      {me ? (
        <LeafletMap
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialCenter={me}
          initialZoom={16}
          user={me}
          circle={center ? { center, radius: RADIUS_M } : null}
          markers={reports.map((r) => ({ id: r.id, latitude: r.latitude, longitude: r.longitude, color: statusColor[r.status].fg, selected: r.id === selected?.id }))}
          onMarkerPress={(id) => setSelected(reports.find((r) => r.id === id) ?? null)}
          onMapPress={() => setSelected(null)}
          onMoveEnd={setViewCenter}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, s.placeholder]}>
          {loading ? <ActivityIndicator color={colors.primary} size="large" /> : <Ionicons name="map-outline" size={48} color={colors.border} />}
        </View>
      )}

      <View pointerEvents="none" style={[s.statusShade, { height: insets.top }]} />
      <View style={[s.top, { paddingTop: insets.top + 10 }]}>
        <View style={s.topRow}>
          <View style={s.counter}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={s.counterText}>
              {loading ? 'Buscando reportes…' : `${reports.length} reporte${reports.length === 1 ? '' : 's'} a menos de ${RADIUS_M} m`}
            </Text>
          </View>
          <Pressable style={s.avatar} onPress={() => router.push('/profile')} accessibilityLabel="Perfil">
            <Text style={s.avatarText}>{initials(user?.full_name)}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Pressable key={f.label} onPress={() => changeFilter(f.value)} style={[s.chip, active && s.chipActive]}>
                <Text style={[s.chipText, active && { color: '#fff' }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {error && <Banner tone="danger" text={error} />}
        {movedAway && !loading && (
          <Pressable style={s.searchHere} onPress={searchHere}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Buscar en esta zona</Text>
          </Pressable>
        )}
      </View>

      <View style={s.bottom} pointerEvents="box-none">
        <Pressable style={s.locate} onPress={() => locate(filter)} accessibilityLabel="Centrar en mi ubicación">
          <Ionicons name="locate" size={22} color={colors.ink} />
        </Pressable>

        {selected ? (
          <PointCard report={selected} onClose={() => setSelected(null)} />
        ) : (
          <Button title="Reportar residuos" icon="camera-outline" onPress={() => router.push('/report/evidence')} style={s.cta} />
        )}
      </View>
    </View>
  );
}

function PointCard({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <View style={s.card}>
      {report.photo_url && <Image source={{ uri: report.photo_url }} style={s.cardPhoto} />}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.cardCode}>#{report.code}</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={20} color={colors.muted} />
          </Pressable>
        </View>
        <StatusPill status={report.status} />
        <Text style={s.cardText}>{report.category} · {SIZE_LABEL[report.estimated_size]}</Text>
        <Text style={s.cardMuted} numberOfLines={1}>{report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}</Text>
        <Text style={s.cardMuted}>A {formatDistance(report.distance_m)} · {formatDate(report.created_at)}{report.is_mine ? ' · Tu reporte' : ''}</Text>
        <Pressable onPress={() => router.push({ pathname: '/report/[id]', params: { id: String(report.id) } })}>
          <Text style={s.cardLink}>Ver detalle</Text>
        </Pressable>
      </View>
    </View>
  );
}

const initials = (name?: string) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const s = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  statusShade: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.92)' },
  top: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, gap: 10 },
  topRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  counter: { flex: 1, height: 48, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  counterText: { color: colors.text, fontSize: 14.5, fontWeight: '600' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontWeight: '700', color: colors.ink, fontSize: 14 },
  searchHere: { alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, elevation: 3 },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 12 },
  locate: { alignSelf: 'flex-end', width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  cta: { alignSelf: 'center', paddingHorizontal: 28, elevation: 4 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, elevation: 5, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12 },
  cardPhoto: { width: 96, height: 120, borderRadius: radius.md, backgroundColor: colors.border },
  cardCode: { fontSize: 16, fontWeight: '800', color: colors.ink },
  cardText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  cardMuted: { fontSize: 13, color: colors.muted },
  cardLink: { color: colors.primary, fontWeight: '700', marginTop: 2 },
});
