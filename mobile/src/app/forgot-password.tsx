// Pantalla 06 · Recuperar contraseña (US-01)
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Banner, Button, TextField } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { colors } from '@/lib/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError('Ingresa un correo electrónico válido.');
      return;
    }
    setFieldError(undefined);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSent(res.message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={s.subtitle}>
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva. El enlace caduca en 30 minutos.
        </Text>

        {error && <Banner tone="danger" text={error} />}
        {sent && <Banner tone="info" text={sent} />}

        <TextField label="Correo electrónico" icon="mail-outline" value={email} onChangeText={setEmail}
          placeholder="nombre@correo.pe" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={fieldError} />

        <Button title={sent ? 'Reenviar enlace' : 'Enviar enlace'} icon="paper-plane-outline" onPress={submit} loading={loading} disabled={!email} />
        <Text style={s.footer}>
          ¿Ya la recordaste?{' '}
          <Link href="/sign-in" replace style={s.link}>Iniciar sesión</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 18, backgroundColor: colors.surface },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: -8 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
