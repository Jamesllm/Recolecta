// Detalle de un reporte (estado, foto, ubicación y datos registrados)
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LeafletMap } from '@/components/LeafletMap';
import { Banner, Card, StatusPill } from '@/components/ui';
import { api, ApiError, SIZE_LABEL, URGENCY_LABEL, type Report } from '@/lib/api';
import { formatDate } from '@/lib/location';
import { colors, markerColor, radius } from '@/lib/theme';

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
    ['Urgencia', report.critical ? 'Crítico (urgencia alta, sin asignar)' : URGENCY_LABEL[report.urgency].replace('Urgencia ', '')],
    ['Dirección', report.address || 'No disponible'],
    ...(report.reference ? [['Referencia', report.reference] as [string, string]] : []),
    ['Coordenadas', `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`],
    ['Precisión GPS', report.gps_accuracy_m !== null ? `${Math.round(report.gps_accuracy_m)} m` : 'Ajustada en el mapa'],
    ['Registrado', formatDate(report.created_at)],
    ['Confirmaciones «Sigue ahí»', String(report.confirmations)],
  ];

  return (
    <ScrollView contentContainerStyle={s.content} style={{ backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.code}>#{report.code}</Text>
        <StatusPill status={report.status} />
      </View>
      {report.photo_url && <Image source={{ uri: report.photo_url }} style={s.photo} />}
      {report.timeline && (
        <Card style={{ gap: 0 }}>
          <Text style={s.cardTitle}>Seguimiento</Text>
          {report.timeline.map((step, idx) => (
            <View key={step.key} style={s.step}>
              <View style={s.rail}>
                <View style={[s.stepDot, step.done && s.stepDotDone]}>
                  {step.done && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                {idx < report.timeline!.length - 1 && <View style={[s.stepLine, step.done && s.stepLineDone]} />}
              </View>
              <View style={{ flex: 1, paddingBottom: 14 }}>
                <Text style={[s.stepLabel, !step.done && s.stepPending]}>{step.label}</Text>
                {step.detail && <Text style={s.stepMeta}>{step.detail}</Text>}
                {step.done && step.at && <Text style={s.stepMeta}>{formatDate(step.at)}</Text>}
              </View>
            </View>
          ))}
        </Card>
      )}
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
        markers={[{ id: report.id, latitude: report.latitude, longitude: report.longitude, color: markerColor(report) }]}
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
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  step: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 20 },
  stepDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  stepLineDone: { backgroundColor: colors.primary },
  stepLabel: { fontSize: 14.5, fontWeight: '700', color: colors.ink },
  stepPending: { color: colors.muted, fontWeight: '600' },
  stepMeta: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
});
