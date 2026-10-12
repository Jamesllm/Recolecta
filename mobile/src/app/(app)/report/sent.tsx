// Pantalla 12 · Reporte enviado: código de seguimiento (US-02)
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useSession } from '@/lib/session';
import { colors, radius } from '@/lib/theme';

export default function Sent() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
  const firstName = user?.full_name.split(' ')[0];

  return (
    <View style={[s.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 16 }]}>
      <View style={s.halo}>
        <View style={s.circle}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
      </View>
      <Text style={s.title}>¡Reporte enviado!</Text>
      <Text style={s.subtitle}>
        Gracias{firstName ? `, ${firstName}` : ''}. Tu reporte quedó registrado con estado «Pendiente» y ya es visible para la municipalidad.
      </Text>
      <View style={s.codeBox}>
        <Text style={s.codeLabel}>CÓDIGO DE SEGUIMIENTO</Text>
        <Text style={s.code}>#{code}</Text>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 12, alignSelf: 'stretch' }}>
        <Button title="Ver estado del reporte" onPress={() => router.replace({ pathname: '/report/[id]', params: { id } })} />
        <Button title="Volver al mapa" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, gap: 16, backgroundColor: colors.surface },
  halo: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, marginTop: 8 },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  codeBox: { alignSelf: 'stretch', alignItems: 'center', gap: 4, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  codeLabel: { fontSize: 12.5, letterSpacing: 1, color: colors.muted, fontWeight: '600' },
  code: { fontSize: 24, fontWeight: '800', color: colors.ink },
});
