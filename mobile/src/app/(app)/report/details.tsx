// Pantalla 11 · Nuevo reporte · Paso 2: detalles del residuo (US-02)
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Button, StepBar } from '@/components/ui';
import { api, ApiError, SIZE_LABEL, type Category, type Size } from '@/lib/api';
import { useReportDraft } from '@/lib/reportDraft';
import { colors, radius } from '@/lib/theme';

const TYPES: { value: Category; icon: ComponentProps<typeof Ionicons>['name']; note?: string }[] = [
  { value: 'Orgánico', icon: 'leaf-outline' },
  { value: 'Inorgánico', icon: 'reload-outline' },
  { value: 'Escombros', icon: 'hammer-outline' },
  { value: 'Peligroso', icon: 'warning-outline', note: 'Requiere manejo especial' },
];

const SIZES: { value: Size; help: string }[] = [
  { value: 'small', help: 'Cabe en un tacho de basura público' },
  { value: 'medium', help: 'Varias bolsas o residuos dispersos en un área pequeña' },
  { value: 'large', help: 'Desmonte, muebles o vertido de gran volumen' },
];

const MAX_DESC = 280;

export default function Details() {
  const insets = useSafeAreaInsets();
  const { photo, location, reset } = useReportDraft();
  const [category, setCategory] = useState<Category | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!photo || !location || !category || !size) return;
    setSending(true);
    setError(null);
    try {
      const res = await api.createReport({
        photo,
        latitude: location.latitude,
        longitude: location.longitude,
        gps_accuracy_m: location.accuracy,
        address: location.address,
        category,
        estimated_size: size,
        description,
      });
      reset();
      router.dismissAll();
      router.push({ pathname: '/report/sent', params: { id: String(res.data.id), code: res.data.code } });
    } catch (e) {
      setError(e instanceof ApiError ? Object.values(e.fields)[0] || e.message : 'No se pudo enviar el reporte.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ backgroundColor: colors.surface }}>
        <StepBar step={2} label="Detalles del residuo" />
      </View>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Banner text="Clasifica el residuo y estima su tamaño para asignar el equipo de recolección adecuado." />
        {error && <Banner tone="danger" text={error} />}

        <Text style={s.section}>Tipo de residuo</Text>
        <View style={s.grid}>
          {TYPES.map((t) => {
            const active = category === t.value;
            return (
              <Pressable key={t.value} style={[s.type, active && s.active]} onPress={() => setCategory(t.value)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
                <View style={s.typeHead}>
                  <View style={s.typeIcon}><Ionicons name={t.icon} size={22} color={t.value === 'Peligroso' ? colors.warning : colors.primary} /></View>
                  <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? colors.primary : '#CBD5E1'} />
                </View>
                <Text style={s.typeText}>{t.value}</Text>
                {t.note && <Text style={s.typeNote}>{t.note}</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={s.section}>Tamaño estimado</Text>
        {SIZES.map((o) => {
          const active = size === o.value;
          return (
            <Pressable key={o.value} style={[s.size, active && s.active]} onPress={() => setSize(o.value)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? colors.primary : '#CBD5E1'} />
              <View style={{ flex: 1 }}>
                <Text style={s.sizeTitle}>{SIZE_LABEL[o.value]}</Text>
                <Text style={s.sizeHelp}>{o.help}</Text>
              </View>
            </Pressable>
          );
        })}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.section}>Descripción adicional</Text>
          <Text style={s.optional}>Opcional</Text>
        </View>
        <View style={s.textarea}>
          <TextInput
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, MAX_DESC))}
            placeholder="Describe el estado de los residuos, si bloquean el paso o cualquier detalle útil para el equipo…"
            placeholderTextColor="#94A3B8"
            multiline
            style={{ minHeight: 90, fontSize: 15, color: colors.ink, textAlignVertical: 'top' }}
          />
          <Text style={s.counter}>{description.length} / {MAX_DESC}</Text>
        </View>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Atrás" variant="secondary" onPress={() => router.back()} style={{ paddingHorizontal: 24 }} />
        <Button title="Enviar reporte" icon="send" onPress={send} loading={sending} disabled={!category || !size || !photo || !location} style={{ flex: 1 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  section: { fontSize: 18, fontWeight: '700', color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  type: { width: '47.5%', minHeight: 104, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  active: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryTint },
  typeHead: { flexDirection: 'row', justifyContent: 'space-between' },
  typeIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  typeText: { fontSize: 15.5, fontWeight: '700', color: colors.ink },
  typeNote: { fontSize: 12.5, color: '#B45309', fontWeight: '600' },
  size: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 },
  sizeTitle: { fontSize: 15.5, fontWeight: '700', color: colors.ink },
  sizeHelp: { fontSize: 13.5, color: colors.muted },
  optional: { fontSize: 12.5, color: colors.muted, backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden' },
  textarea: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12 },
  counter: { alignSelf: 'flex-end', color: '#94A3B8', fontSize: 12.5 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
