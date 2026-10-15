// Mis reportes: lista de los reportes enviados por el vecino
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, StatusPill } from '@/components/ui';
import { api, ApiError, SIZE_LABEL, type Report } from '@/lib/api';
import { formatDate } from '@/lib/location';
import { useSession } from '@/lib/session';
import { colors, radius } from '@/lib/theme';

export default function MyReports() {
  const { isGuest } = useSession();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setReports((await api.myReports()).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar tus reportes.');
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      data={reports ?? []}
      keyExtractor={(r) => String(r.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          {error && <Banner tone="danger" text={error} />}
          {isGuest && <Banner text="Como invitado ves los reportes enviados desde este teléfono. Crea una cuenta en Perfil para no perderlos." />}
        </View>
      }
      ListEmptyComponent={reports ? (
        <View style={s.empty}>
          <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
          <Text style={s.emptyTitle}>Aún no has enviado reportes</Text>
          <Text style={s.emptyText}>Cuando reportes un punto de acumulación de residuos, podrás seguir su estado aquí.</Text>
          <Button title="Reportar residuos" icon="camera-outline" onPress={() => router.push('/report/evidence')} />
        </View>
      ) : null}
      renderItem={({ item }) => (
        <Pressable style={s.item} onPress={() => router.push({ pathname: '/report/[id]', params: { id: String(item.id) } })}>
          {item.photo_url ? <Image source={{ uri: item.photo_url }} style={s.thumb} /> : <View style={s.thumb} />}
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.code}>#{item.code}</Text>
              <StatusPill status={item.status} />
            </View>
            <Text style={s.text}>{item.category} · {SIZE_LABEL[item.estimated_size]}</Text>
            <Text style={s.muted} numberOfLines={1}>{item.address || `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`}</Text>
            <Text style={s.muted}>{formatDate(item.created_at)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  emptyText: { fontSize: 14.5, color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  item: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12 },
  thumb: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.border },
  code: { fontSize: 16, fontWeight: '800', color: colors.ink },
  text: { fontSize: 14, color: colors.text, fontWeight: '600' },
  muted: { fontSize: 13, color: colors.muted },
});
