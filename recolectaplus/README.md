# Recolecta+ | Panel Web Administrativo (Command Center)

Panel administrativo y centro de mando para la gestión inteligente de residuos urbanos, desarrollado con **Next.js 16 (App Router)**, **Tailwind CSS**, **TypeScript**, **Lucide React** y mapas geoespaciales interactivos con **Leaflet**.

---

## 📸 Pantallas y Vistas Principales

### 1. Dashboard General con Mapa de Calor (`/`)
- **Header Superior**: Barra de búsqueda global, selector de perfil y estado de conexión en vivo.
- **Métricas Resumen**: Alertas pendientes, cuadrillas asignadas, incidentes resueltos y tiempo promedio de respuesta.
- **Layout 70% / 30%**:
  - **70% (Mapa de Calor y Densidad)**: React-Leaflet (`ssr: false`) con círculos de densidad (`12 alerts`, `8 alerts`, `5 alerts`) en tonalidades verde, ámbar y rojo, popups con fotos y leyenda de estados.
  - **30% (Áreas Prioritarias)**: Focos críticos (Centro-Norte, Industrial Sur, Mercado Central) con barras de progreso y botón verde destacado *"Ejecutar la optimización de rutas con IA"*.

### 2. Optimización de Rutas con IA y Rastreo en Vivo (`/routes`)
- **Breadcrumbs**: `Consola / Optimización de rutas / Recorridos activos`.
- **Header**: Badge interactivo `AI Model v2.1 Active` y botón de refresco.
- **Layout de 3 Columnas**:
  - **Panel Izquierdo**: Clústeres espaciales ordenables por urgencia (Cluster #04, Cluster #07, Cluster #09, Cluster #12) con barras de saturación.
  - **Panel Central (Tracking en Vivo)**: Mapa Leaflet con polyline verde que une las paradas numeradas (1, 2, 3, 4...) hacia la estrella dorada del *Municipal Dump* (Relleno Sanitario).
  - **Panel Derecho (Métricas y Despacho)**: Distancia estimada (km), tiempo estimado (min), capacidad requerida (%), selector de camión/conductor (`Camión #07 — J. Martínez`) y botón de despacho digital.

### 3. Tabla Interactiva de Gestión de Incidentes (`/incidents`)
- **Header**: Conteo de pendientes críticas en badge rojo y botón de recarga.
- **Barra de Filtros**: Búsqueda textual por ID/ubicación, dropdown de categoría, selector de estado y exportación directa a CSV.
- **Tabla de Incidentes**: Checkbox, ID (`#RL-102`), miniaturas de fotos ciudadanas, fecha, coordenadas WGS84, urgencia y estado.
- **Modal/Drawer Lateral**: Despliegue con fotografía ampliada, datos del ciudadano, coordenadas exactas y botón para marcar el incidente como *"Resuelto"*.

---

## 🚀 Instalación y Ejecución

1. **Variables de entorno**:
   Asegúrate de contar con el archivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Verificación de tipos TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
