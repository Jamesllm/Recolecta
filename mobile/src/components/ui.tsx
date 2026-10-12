// Componentes base de la app (equivalentes a los componentes del sistema de diseño en Figma)
import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { STATUS_LABEL, type ReportStatus } from '@/lib/api';
import { colors, radius, statusColor } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tint';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const fg = variant === 'primary' ? '#FFFFFF' : variant === 'tint' ? colors.primary : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [s.btn, s[variant], (disabled || loading) && s.disabled, pressed && { opacity: 0.85 }, style]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[s.btnText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function TextField({ label, icon, error, help, secure, ...props }: TextInputProps & {
  label: string;
  icon: IconName;
  error?: string;
  help?: string;
  secure?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, focused && s.inputFocus, !!error && s.inputError]}>
        <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.muted} />
        <TextInput
          {...props}
          secureTextEntry={secure && hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#94A3B8"
          style={s.inputText}
        />
        {secure && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {(error || help) && <Text style={[s.help, !!error && { color: colors.danger }]}>{error || help}</Text>}
    </View>
  );
}

export function StatusPill({ status }: { status: ReportStatus }) {
  const c = statusColor[status];
  return (
    <View style={[s.pill, { backgroundColor: c.bg }]}>
      <View style={[s.dot, { backgroundColor: c.fg }]} />
      <Text style={[s.pillText, { color: c.fg }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function StepBar({ step, label }: { step: 1 | 2; label: string }) {
  return (
    <View style={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Paso {step} de 2</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[s.bar, { backgroundColor: colors.primary }]} />
        <View style={[s.bar, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
      </View>
    </View>
  );
}

export function Banner({ text, tone = 'info' }: { text: string; tone?: 'info' | 'danger' | 'warning' }) {
  const c = tone === 'danger' ? [colors.danger, colors.dangerTint] : tone === 'warning' ? [colors.warning, colors.warningTint] : [colors.info, colors.infoTint];
  return (
    <View style={[s.banner, { backgroundColor: c[1] }]}>
      <Ionicons name={tone === 'info' ? 'information-circle-outline' : 'alert-circle-outline'} size={20} color={c[0]} />
      <Text style={{ color: c[0], flex: 1, fontSize: 14, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tint: { backgroundColor: colors.primaryTint },
  disabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  input: { height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  inputFocus: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryTint },
  inputError: { borderColor: colors.danger },
  inputText: { flex: 1, fontSize: 16, color: colors.ink },
  help: { fontSize: 12.5, color: colors.muted },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontSize: 12.5, fontWeight: '700' },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  banner: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, alignItems: 'flex-start' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16 },
});
