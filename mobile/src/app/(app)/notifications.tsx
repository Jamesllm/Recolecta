// Pantalla 15 · Notificaciones (US-06): avisos sobre los cambios de estado de mis reportes
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Banner } from '@/components/ui';
import { api, ApiError, type AppNotification } from '@/lib/api';
import { timeAgo } from '@/lib/location';
import { colors, radius, statusColor } from '@/lib/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
const ICON: Record<AppNotification['status'], 'time-outline' | 'car-outline' | 'checkmark-circle-outline' | 'close-circle-outline'> = {
  pending: 'time-outline',
  assigned: 'car-outline',
  resolved: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
};

/** Agrupa los avisos en «Hoy», «Esta semana» y «Anteriores» */
const groupByDate = (items: AppNotification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const groups: { title: string; data: AppNotification[] }[] = [
    { title: 'Hoy', data: [] },
    { title: 'Esta semana', data: [] },
    { title: 'Anteriores', data: [] },
  ];
  for (const n of items) {
    const t = new Date(n.created_at).getTime();
    const idx = t >= today.getTime() ? 0 : t >= today.getTime() - 6 * DAY_MS ? 1 : 2;
    groups[idx].data.push(n);
  }
  return groups.filter((g) => g.data.length);
};

export default function Notifications() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.notifications();
      setItems(res.data);
      setUnread(res.unread);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los avisos.');
      setItems((cur) => cur ?? []);
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

  // Tocar un aviso lo marca como leído y abre el detalle del reporte con su línea de seguimiento (pantalla 14)
  const open = (n: AppNotification) => {
    if (!n.read) {
      setItems((cur) => cur?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? cur);
      setUnread((u) => Math.max(0, u - 1));
      api.readNotification(n.id).catch(() => {});
    }
    router.push({ pathname: '/report/[id]', params: { id: String(n.incident_id) } });
  };

  const readAll = async () => {
    setItems((cur) => cur?.map((x) => ({ ...x, read: true })) ?? cur);
    setUnread(0);
    await api.readAllNotifications().catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerRight: () =>
            unread > 0 ? (
              <Pressable onPress={readAll} hitSlop={10} accessibilityLabel="Marcar todas como leídas">
                <Text style={s.readAll}>Marcar leídas</Text>
              </Pressable>
            ) : null,
        }}
      />
      {items === null ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <SectionList
          sections={groupByDate(items)}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={error ? <Banner tone="danger" text={error} /> : null}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="notifications-off-outline" size={44} color={colors.border} />
              <Text style={s.emptyTitle}>Aún no tienes avisos</Text>
              <Text style={s.emptyText}>Te avisaremos aquí cuando el municipio cambie el estado de uno de tus reportes.</Text>
            </View>
          }
          renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
          renderItem={({ item }) => {
            const tone = statusColor[item.status];
            return (
              <Pressable onPress={() => open(item)} style={({ pressed }) => [s.item, !item.read && s.itemUnread, pressed && { opacity: 0.85 }]}>
                <View style={[s.icon, { backgroundColor: tone.bg }]}>
                  <Ionicons name={ICON[item.status]} size={20} color={tone.fg} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.title, !item.read && { fontWeight: '800' }]}>{item.title}</Text>
                  <Text style={s.body} numberOfLines={3}>{item.body}</Text>
                  <Text style={s.time}>{timeAgo(item.created_at)}</Text>
                </View>
                {!item.read && <View style={s.dot} accessibilityLabel="No leído" />}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 10, flexGrow: 1 },
  readAll: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  section: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8, marginBottom: 2 },
  item: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  itemUnread: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  body: { fontSize: 13.5, color: colors.text, lineHeight: 19 },
  time: { fontSize: 12, color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32, paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
