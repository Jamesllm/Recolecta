# Recolecta+ | App móvil del vecino

App en **Expo SDK 57 (React Native)** que implementa las historias del Sprint 1 con el diseño del prototipo de Figma. Los mapas usan **Leaflet + OpenStreetMap** dentro de un WebView (`src/components/LeafletMap.tsx`), por lo que no requieren clave de Google Maps; el celular necesita conexión a internet para cargar las teselas.

| Pantalla (Figma) | Archivo | Historia |
|---|---|---|
| 04 · Iniciar sesión | `src/app/sign-in.tsx` | US-01 |
| 05 · Crear cuenta | `src/app/sign-up.tsx` | US-01 |
| 07 · Inicio (mapa) y 08 · Detalle de punto | `src/app/(app)/(tabs)/index.tsx` | US-03 |
| 09 · Nuevo reporte · Paso 1 | `src/app/(app)/report/evidence.tsx` | US-02 |
| 10 · Ajustar ubicación | `src/app/(app)/report/adjust.tsx` | US-02 |
| 11 · Nuevo reporte · Paso 2 | `src/app/(app)/report/details.tsx` | US-02 |
| 12 · Reporte enviado | `src/app/(app)/report/sent.tsx` | US-02 |
| 13 · Mis reportes y 14 · Detalle del reporte | `src/app/(app)/(tabs)/mine.tsx`, `src/app/(app)/report/[id].tsx` | Seguimiento |
| 16 · Perfil | `src/app/(app)/(tabs)/profile.tsx` | Cierre de sesión |

## Ejecución

1. Iniciar la API (`backend/`, `npm run dev`). En la consola aparece la línea `App móvil (misma red Wi-Fi): http://192.168.x.x:4000/api`.
2. Configurar la app:
   ```bash
   cp .env.example .env    # pegar esa URL en EXPO_PUBLIC_API_URL
   npm install
   npx expo start
   ```
3. Abrir **Expo Go** en el celular y escanear el código QR. El celular y la PC deben estar en la misma red Wi-Fi.

Si la app no conecta, permitir el puerto 4000 en el firewall de Windows (red privada).

## Comprobaciones

```bash
npm run typecheck     # TypeScript
npx expo-doctor       # dependencias compatibles con el SDK
```
