import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="mine"
        options={{ title: 'Mis reportes', tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
