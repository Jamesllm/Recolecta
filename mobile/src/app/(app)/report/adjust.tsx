// Pantalla 10 · Ajustar ubicación: el vecino mueve el mapa bajo el pin central
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeafletMap } from '@/components/LeafletMap';
import { Button, TextField } from '@/components/ui';
import { addressFor } from '@/lib/location';
import { useReportDraft } from '@/lib/reportDraft';
import { colors, radius } from '@/lib/theme';

export default function Adjust() {
  const insets = useSafeAreaInsets();
  const { location, setLocation } = useReportDraft();
  const [center, setCenter] = useState(location ? { latitude: location.latitude, longitude: location.longitude } : null);
  const [reference, setReference] = useState(location?.reference ?? '');
  const [saving, setSaving] = useState(false);

  if (!location || !center) {
    return (
      <View style={s.empty}>
        <Text style={{ color: colors.muted }}>Primero obtén la ubicación GPS en el paso 1.</Text>
      </View>
    );
  }

  const confirm = async () => {
    setSaving(true);
    const address = await addressFor(center.latitude, center.longitude);
    setLocation({ ...center, accuracy: null, address, reference: reference.trim() });
    setSaving(false);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <LeafletMap
        style={StyleSheet.absoluteFill}
        initialCenter={{ latitude: location.latitude, longitude: location.longitude }}
        initialZoom={18}
        onMoveEnd={setCenter}
      />
      <View pointerEvents="none" style={s.pinWrap}>
        <Ionicons name="location" size={46} color={colors.danger} />
      </View>
      <View style={s.hint}>
        <Text style={s.hintText}>Mueve el mapa hasta que el pin quede sobre los residuos.</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.footerWrap}>
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={s.coords}>{center.latitude.toFixed(5)}, {center.longitude.toFixed(5)}</Text>
          <TextField
            label="Referencia (opcional)"
            icon="flag-outline"
            value={reference}
            onChangeText={(t) => setReference(t.slice(0, MAX_REFERENCE))}
            placeholder="Ej.: frente al parque, junto al poste"
            help={`${reference.length} / ${MAX_REFERENCE}`}
          />
          <Button title="Confirmar ubicación" icon="checkmark" onPress={confirm} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const MAX_REFERENCE = 140;

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  pinWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 46 },
  hint: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, elevation: 3 },
  hintText: { color: colors.text, textAlign: 'center', fontWeight: '600' },
  footerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  footer: { padding: 16, gap: 10, backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, elevation: 6 },
  coords: { textAlign: 'center', color: colors.muted },
});
