import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SessionProvider, useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();
// Fondo claro de la ventana para que los iconos oscuros de la barra de estado se lean (también en Expo Go)
SystemUI.setBackgroundColorAsync(colors.surface);

function SplashScreenController() {
  const { isLoading } = useSession();
  if (!isLoading) SplashScreen.hide();
  return null;
}

function RootNavigator() {
  const { user, isLoading } = useSession();
  if (isLoading) return null;
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="sign-up" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      {/* Translúcida: la app se dibuja bajo la barra (fondo blanco) y los iconos oscuros se leen; los márgenes los dan las zonas seguras */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent hidden={false} />
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}
