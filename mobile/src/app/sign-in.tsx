// Pantalla 04 · Iniciar sesión
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, TextField } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>¡Hola de nuevo!</Text>
        <Text style={s.subtitle}>Ingresa para reportar residuos y seguir tus reportes.</Text>

        {error && <Banner tone="danger" text={error} />}

        <TextField label="Correo electrónico" icon="mail-outline" value={email} onChangeText={setEmail}
          placeholder="nombre@correo.pe" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <TextField label="Contraseña" icon="lock-closed-outline" value={password} onChangeText={setPassword}
          placeholder="Tu contraseña" secure autoComplete="password" />

        <View style={{ flex: 1, minHeight: 24 }} />
        <Button title="Iniciar sesión" onPress={submit} loading={loading} disabled={!email || !password} />
        <Text style={s.footer}>
          ¿No tienes cuenta?{' '}
          <Link href="/sign-up" replace style={s.link}>Crear cuenta</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 18, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: -8 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
