// Detalle de un reporte (estado, foto, ubicación y datos registrados)
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LeafletMap } from '@/components/LeafletMap';
import { Banner, Card, StatusPill } from '@/components/ui';
import { api, ApiError, SIZE_LABEL, type Report } from '@/lib/api';
import { formatDate } from '@/lib/location';
import { colors, radius, statusColor } from '@/lib/theme';

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.report(Number(id))
      .then((r) => setReport(r.data))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar el reporte.'));
  }, [id]);

  if (error) return <View style={s.center}><Banner tone="danger" text={error} /></View>;
  if (!report) return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const rows: [string, string][] = [
    ['Tipo de residuo', report.category],
    ['Tamaño estimado', SIZE_LABEL[report.estimated_size]],
    ['Dirección', report.address || 'No disponible'],
    ['Coordenadas', `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`],
    ['Precisión GPS', report.gps_accuracy_m !== null ? `${Math.round(report.gps_accuracy_m)} m` : 'Ajustada en el mapa'],
    ['Registrado', formatDate(report.created_at)],
  ];

  return (
    <ScrollView contentContainerStyle={s.content} style={{ backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.code}>#{report.code}</Text>
        <StatusPill status={report.status} />
      </View>
      {report.photo_url && <Image source={{ uri: report.photo_url }} style={s.photo} />}
      <Card style={{ gap: 12 }}>
        {rows.map(([k, v]) => (
          <View key={k} style={s.row}>
            <Text style={s.key}>{k}</Text>
            <Text style={s.value}>{v}</Text>
          </View>
        ))}
        {report.description && (
          <View style={{ gap: 4 }}>
            <Text style={s.key}>Descripción</Text>
            <Text style={s.desc}>{report.description}</Text>
          </View>
        )}
      </Card>
      <LeafletMap
        style={s.map}
        initialCenter={{ latitude: report.latitude, longitude: report.longitude }}
        initialZoom={17}
        interactive={false}
        markers={[{ id: report.id, latitude: report.latitude, longitude: report.longitude, color: statusColor[report.status].fg }]}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 20, gap: 16 },
  code: { fontSize: 24, fontWeight: '800', color: colors.ink },
  photo: { width: '100%', height: 240, borderRadius: radius.lg, backgroundColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  key: { color: colors.muted, fontSize: 14 },
  value: { color: colors.ink, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  desc: { color: colors.text, fontSize: 14.5, lineHeight: 21 },
  map: { height: 180, borderRadius: radius.lg, overflow: 'hidden' },
});
