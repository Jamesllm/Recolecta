// Pantalla 05 · Crear cuenta (US-01)
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SelectField, type Option } from '@/components/SelectField';
import { Banner, Button, TextField } from '@/components/ui';
import { api, ApiError, titleCase, type UbigeoItem } from '@/lib/api';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])(?=.*\d).{8,}$/;

export default function SignUp() {
  const { signUp } = useSession();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [dep, setDep] = useState<string | null>(null);
  const [prov, setProv] = useState<string | null>(null);
  const [dist, setDist] = useState<string | null>(null);
  const [lists, setLists] = useState<{ dep: Option[]; prov: Option[]; dist: Option[] }>({ dep: [], prov: [], dist: [] });
  const [loadingList, setLoadingList] = useState<'dep' | 'prov' | 'dist' | null>('dep');
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });
  const toOptions = (items: UbigeoItem[]) => items.map((i) => ({ id: i.id, label: titleCase(i.nombre) }));

  // Listas encadenadas de ubigeo: departamento → provincia → distrito
  const loadList = async (key: 'dep' | 'prov' | 'dist', fetcher: () => Promise<{ data: UbigeoItem[] }>) => {
    setLoadingList(key);
    try {
      const res = await fetcher();
      setLists((l) => ({ ...l, [key]: toOptions(res.data) }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar la lista de ubicaciones.');
    } finally {
      setLoadingList(null);
    }
  };

  useEffect(() => {
    loadList('dep', api.departamentos);
  }, []);

  const chooseDep = (id: string) => {
    setDep(id);
    setProv(null);
    setDist(null);
    setLists((l) => ({ ...l, prov: [], dist: [] }));
    loadList('prov', () => api.provincias(id));
  };

  const chooseProv = (id: string) => {
    setProv(id);
    setDist(null);
    setLists((l) => ({ ...l, dist: [] }));
    loadList('dist', () => api.distritos(id));
  };

  // Validación en el teléfono; el servidor vuelve a validar todo
  const validate = () => {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 3) e.full_name = 'Ingresa tu nombre completo.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Ingresa un correo electrónico válido.';
    if (!PASSWORD_RE.test(form.password)) e.password = 'Mínimo 8 caracteres, con al menos una letra y un número.';
    if (!dist) e.ubigeo = 'Selecciona tu departamento, provincia y distrito.';
    if (!accept) e.accept_terms = 'Debes aceptar los Términos de uso y la Política de privacidad.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const welcome = await signUp({ ...form, ubigeo: dist as string, accept_terms: accept });
      Alert.alert('Cuenta creada', welcome);
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fields);
        setError(e.message);
      } else setError('No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Únete a Recolecta+</Text>
        <Text style={s.subtitle}>Crea tu cuenta para reportar residuos y ayudar a mantener limpio tu distrito.</Text>

        {error && <Banner tone="danger" text={error} />}

        <TextField label="Nombre completo" icon="person-outline" value={form.full_name} onChangeText={set('full_name')}
          placeholder="Nombre y apellidos" autoComplete="name" error={errors.full_name} />
        <TextField label="Correo electrónico" icon="mail-outline" value={form.email} onChangeText={set('email')}
          placeholder="nombre@correo.pe" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />
        <TextField label="Contraseña" icon="lock-closed-outline" value={form.password} onChangeText={set('password')}
          placeholder="Crea una contraseña" secure autoComplete="new-password" error={errors.password}
          help="Mínimo 8 caracteres, con al menos una letra y un número." />
        <SelectField label="Departamento" icon="map-outline" placeholder="Selecciona tu departamento"
          options={lists.dep} value={dep} onChange={chooseDep} loading={loadingList === 'dep'} />
        <SelectField label="Provincia" icon="business-outline" placeholder={dep ? 'Selecciona tu provincia' : 'Primero elige el departamento'}
          options={lists.prov} value={prov} onChange={chooseProv} disabled={!dep} loading={loadingList === 'prov'} />
        <SelectField label="Distrito" icon="location-outline" placeholder={prov ? 'Selecciona tu distrito' : 'Primero elige la provincia'}
          options={lists.dist} value={dist} onChange={setDist} disabled={!prov} loading={loadingList === 'dist'} error={errors.ubigeo} />

        <Pressable style={s.check} onPress={() => setAccept(!accept)} accessibilityRole="checkbox" accessibilityState={{ checked: accept }}>
          <Ionicons name={accept ? 'checkbox' : 'square-outline'} size={24} color={accept ? colors.primary : colors.muted} />
          <Text style={s.checkText}>Acepto los Términos de uso y la Política de privacidad de Recolecta+.</Text>
        </Pressable>
        {errors.accept_terms && <Text style={s.error}>{errors.accept_terms}</Text>}

        <Button title="Crear cuenta" onPress={submit} loading={loading} />
        <Text style={s.footer}>
          ¿Ya tienes una cuenta?{' '}
          <Link href="/sign-in" replace style={s.link}>Iniciar sesión</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: -6 },
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 12.5, marginTop: -8 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
