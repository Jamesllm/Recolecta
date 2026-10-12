// Perfil del vecino y cierre de sesión
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { titleCase } from '@/lib/api';
import { formatDate } from '@/lib/location';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

export default function Profile() {
  const { user, signOut } = useSession();
  if (!user) return null;

  const rows: [ComponentProps<typeof Ionicons>['name'], string, string][] = [
    ['mail-outline', 'Correo electrónico', user.email],
    ['location-outline', 'Distrito', titleCase(user.ubigeo.distrito)],
    ['map-outline', 'Provincia y departamento', `${titleCase(user.ubigeo.provincia)}, ${titleCase(user.ubigeo.departamento)}`],
    ['calendar-outline', 'Miembro desde', formatDate(user.created_at)],
  ];

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión en este teléfono?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={s.content}>
      <View style={s.head}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user.full_name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')}</Text>
        </View>
        <Text style={s.name}>{user.full_name}</Text>
        <Text style={s.role}>Vecino</Text>
      </View>
      <Card style={{ gap: 16 }}>
        {rows.map(([icon, label, value]) => (
          <View key={label} style={s.row}>
            <Ionicons name={icon} size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          </View>
        ))}
      </Card>
      <Button title="Cerrar sesión" icon="log-out-outline" variant="secondary" onPress={confirmSignOut} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 20 },
  head: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: colors.ink },
  role: { fontSize: 14, color: colors.muted },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  label: { fontSize: 13, color: colors.muted },
  value: { fontSize: 15.5, color: colors.ink, fontWeight: '600' },
});
