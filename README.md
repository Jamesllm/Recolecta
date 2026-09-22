# Recolecta+ ♻️

Sistema inteligente y georreferenciado para la gestión comunitaria y optimización de recolección de residuos urbanos.

---

## 🏛️ Arquitectura del Sistema

El ecosistema de **Recolecta+** se organiza en los siguientes módulos:

1. **Backend API REST (Fase 2)**:
   - Construido en **Node.js** y **Express**.
   - Conectado a **PostgreSQL** con la extensión geoespacial **PostGIS**.
   - Soporta registro y consulta de incidentes con coordenadas de alta precisión (WGS84 EPSG:4326).
   - Configurado con políticas de CORS para clientes web (React) y móviles (React Native / Expo).
   - Más detalles en [backend/README.md](file:///c:/Users/Ronal%20Llapapasca/Documents/Universidad/2026-2/Innovacion/Recolecta+/backend/README.md).

2. **Módulo de Inteligencia Artificial & Clustering (Fase 3)**:
   - Microservicio en **Python 3.11+** (`cluster_service.py`).
   - Algoritmo de agrupamiento no supervisado (**K-Means**) con Scikit-Learn y Pandas.
   - Extrae puntos en estado `pending`, calcula centroides geográficos y los persiste en PostGIS para la planificación de rutas de recojo.

3. **Frontend Web Administrativo (Command Center)**:
   - Construido en **Next.js 16** (App Router), **Tailwind CSS**, **Lucide React** y mapas **Leaflet**.
   - Incluye Dashboard con mapa de calor y círculos de densidad (70/30), consola de optimización de rutas por IA con polylines hacia el Relleno Sanitario, y tabla interactiva de gestión de incidentes con filtros y drawer lateral.
   - Código en `recolectaplus/`.

---

## 🚀 Inicio Rápido

### 1. Backend API REST (Node.js)
```bash
cd backend
npm install
npm run dev
```
Ver detalles completos en [backend/README.md](file:///c:/Users/Ronal%20Llapapasca/Documents/Universidad/2026-2/Innovacion/Recolecta+/backend/README.md).

### 2. Frontend Web Administrativo (Next.js)
```bash
cd recolectaplus
npm install
npm run dev
```
Acceder a [http://localhost:3000](http://localhost:3000).

### 3. Módulo de IA (Python)
```bash
cd backend/ai
python cluster_service.py --clusters 3
```

