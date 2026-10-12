// Pantalla 09 · Nuevo reporte · Paso 1: evidencia y ubicación (US-02)
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Button, Card, StepBar } from '@/components/ui';
import { api } from '@/lib/api';
import { addressFor, currentPosition, ensureLocationPermission } from '@/lib/location';
import { preparePhoto } from '@/lib/photo';
import { useReportDraft } from '@/lib/reportDraft';
import { colors, radius } from '@/lib/theme';

const DUPLICATE_RADIUS_M = 50;

export default function Evidence() {
  const insets = useSafeAreaInsets();
  const { photo, location, setPhoto, setLocation, reset } = useReportDraft();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCount, setNearbyCount] = useState(0);

  const detectLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      if (!(await ensureLocationPermission())) {
        setError('Activa el permiso de ubicación para registrar dónde están los residuos.');
        return;
      }
      const pos = await currentPosition();
      setLocation({ ...pos, address: await addressFor(pos.latitude, pos.longitude) });
    } catch {
      setError('No se pudo obtener la ubicación GPS. Verifica que el GPS esté encendido.');
    } finally {
      setLocating(false);
    }
  }, [setLocation]);

  // Un reporte nuevo empieza con el borrador vacío y la ubicación actual
  useEffect(() => {
    reset();
    detectLocation();
  }, []);

  // Aviso de posibles duplicados cerca del punto elegido (US-03)
  useFocusEffect(useCallback(() => {
    if (!location) return;
    api.nearby(location.latitude, location.longitude, DUPLICATE_RADIUS_M, 'pending')
      .then((r) => setNearbyCount(r.data.length))
      .catch(() => setNearbyCount(0));
  }, [location]));

  const pick = async (source: 'camera' | 'library') => {
    setError(null);
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError('Activa el permiso de cámara para tomar la foto.');
        return;
      }
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
    const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.length) return;
    try {
      setPhoto(await preparePhoto(res.assets[0]));
    } catch {
      setError('No se pudo procesar la foto. Intenta tomarla de nuevo.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.surface }}>
        <StepBar step={1} label="Evidencia y ubicación" />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {error && <Banner tone="danger" text={error} />}

        <View style={s.sectionRow}>
          <Text style={s.section}>Foto de los residuos</Text>
          {photo && <Text style={s.badge}>● 1 foto</Text>}
        </View>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={s.photo} />
        ) : (
          <Pressable style={[s.photo, s.photoEmpty]} onPress={() => pick('camera')}>
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
            <Text style={{ color: colors.muted }}>Toca para tomar la foto</Text>
          </Pressable>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={photo ? 'Volver a tomar' : 'Tomar foto'} icon="camera-outline" variant="tint" onPress={() => pick('camera')} style={{ flex: 1 }} />
          <Button title="Elegir de galería" icon="image-outline" variant="secondary" onPress={() => pick('library')} style={{ flex: 1 }} />
        </View>

        <Text style={s.section}>Ubicación detectada</Text>
        <Card style={{ gap: 12 }}>
          {locating ? (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.muted }}>Obteniendo ubicación GPS…</Text>
            </View>
          ) : location ? (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={s.address}>{location.address || 'Dirección no disponible'}</Text>
              </View>
              <Text style={s.gps}>
                GPS {location.latitude.toFixed(5)} · {location.longitude.toFixed(5)}
                {location.accuracy !== null ? ` · precisión ${Math.round(location.accuracy)} m` : ' · ajustada en el mapa'}
              </Text>
            </View>
          ) : (
            <Text style={{ color: colors.muted }}>Sin ubicación.</Text>
          )}
          <View style={s.divider} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Pressable style={s.link} onPress={detectLocation}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={s.linkText}>Volver a detectar</Text>
            </Pressable>
            <Pressable style={s.link} onPress={() => router.push('/report/adjust')} disabled={!location}>
              <Ionicons name="locate-outline" size={18} color={colors.primary} />
              <Text style={s.linkText}>Ajustar en el mapa</Text>
            </Pressable>
          </View>
        </Card>

        {nearbyCount > 0 && (
          <Banner tone="warning" text={`Hay ${nearbyCount} reporte${nearbyCount === 1 ? '' : 's'} pendiente${nearbyCount === 1 ? '' : 's'} a menos de ${DUPLICATE_RADIUS_M} m. Revisa el mapa para no duplicarlo.`} />
        )}
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Siguiente: detalles" icon="arrow-forward" onPress={() => router.push('/report/details')} disabled={!photo || !location || locating} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontSize: 18, fontWeight: '700', color: colors.ink },
  badge: { color: colors.primary, backgroundColor: colors.primaryTint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, fontWeight: '700', overflow: 'hidden' },
  photo: { width: '100%', height: 210, borderRadius: radius.lg, backgroundColor: colors.border },
  photoEmpty: { alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryTint, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary },
  address: { fontSize: 15.5, fontWeight: '700', color: colors.ink, flex: 1 },
  gps: { fontSize: 13, color: colors.muted, marginLeft: 24 },
  divider: { height: 1, backgroundColor: colors.border },
  link: { flexDirection: 'row', gap: 6, alignItems: 'center', padding: 4 },
  linkText: { color: colors.primary, fontWeight: '700' },
  footer: { padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
