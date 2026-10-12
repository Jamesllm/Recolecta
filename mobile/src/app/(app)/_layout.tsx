import { Stack } from 'expo-router';
import { ReportDraftProvider } from '@/lib/reportDraft';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  return (
    <ReportDraftProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', color: colors.ink },
          headerTintColor: colors.ink,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="report/evidence" options={{ title: 'Nuevo reporte' }} />
        <Stack.Screen name="report/adjust" options={{ title: 'Ajustar ubicación' }} />
        <Stack.Screen name="report/details" options={{ title: 'Detalles del residuo' }} />
        <Stack.Screen name="report/sent" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="report/[id]" options={{ title: 'Detalle del reporte' }} />
      </Stack>
    </ReportDraftProvider>
  );
}
