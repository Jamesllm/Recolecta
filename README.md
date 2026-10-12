# Recolecta+ ♻️

Sistema inteligente y georreferenciado para la gestión comunitaria y optimización de recolección de residuos urbanos.

Proyecto del curso **Innovación y Transformación Digital** (UTP, 2026-2) · **Grupo 3**: Ronal James Llapapasca Montes (Product Owner), Carlos Andrés Bustamante Suclupe (Scrum Master), Danna Jael Miñan Gonzalez, Víctor Miguel Alonso Reyes Flores y Ángel Eduardo Salas Bances.

---

## 🧭 Sprint 1 (del 10 al 17 de octubre de 2026)

| Historia | Qué se puede hacer | Dónde |
|---|---|---|
| US-01 Registro de ciudadano | Crear cuenta con correo y contraseña validados y su departamento, provincia y distrito (ubigeo); iniciar sesión y mantener la sesión | App móvil · `POST /api/register`, `/api/login` |
| US-02 Reporte con foto y GPS | Tomar o elegir la foto, detectar la ubicación GPS (o ajustarla en el mapa), clasificar el residuo y recibir un código de seguimiento | App móvil · `POST /api/reports` (foto en Amazon S3, punto en PostGIS) |
| US-03 Mapa de reportes cercanos | Ver en el mapa los reportes a menos de 500 m, filtrar por estado y ver el detalle de cada punto | App móvil · `GET /api/reports/nearby` |

Diseño de referencia: [prototipo en Figma](https://www.figma.com/proto/ay8UeV1wq2jKnHS90bKZz3/Recolecta-?node-id=25-5&t=aOT8hrXgXpSaUAUk-1).

Avance hacia el Sprint 2: el panel municipal muestra los reportes reales, ejecuta el agrupamiento K-Means y sugiere el orden de recojo de cada clúster.

---

## 🏛️ Arquitectura

| Módulo | Tecnología | Carpeta |
|---|---|---|
| App móvil del vecino | Expo SDK 57 (React Native), Expo Router, Leaflet + OpenStreetMap (WebView), expo-image-picker, expo-location | [`mobile/`](mobile/README.md) |
| API REST | Node.js, Express, PostgreSQL + PostGIS, JWT, Amazon S3 | [`backend/`](backend/README.md) |
| Agrupamiento K-Means (IA) | Python, Scikit-Learn, Pandas | [`backend/ai/`](backend/ai/cluster_service.py) |
| Panel municipal | Next.js 16, Tailwind CSS, Leaflet + OpenStreetMap | [`frontend/`](frontend/README.md) |

---

## 🚀 Inicio rápido

Requisitos: Node.js 18+, Python 3.11+, PostgreSQL 14+ **con PostGIS**, un bucket de Amazon S3 y la app **Expo Go** en el celular.

| Servicio | Dirección |
|---|---|
| API REST | `http://localhost:4000/api` (en el celular: `http://<IP-de-la-PC>:4000/api`) |
| Panel web | `http://localhost:3000` |

### 1. API y base de datos
```bash
cd backend
cp .env.example .env      # completar DB_PASSWORD, JWT_SECRET y las variables de S3
npm install
npm run db:init           # crea la base con PostGIS y carga el ubigeo del Perú
npm run dev
```

### 2. App móvil
```bash
cd mobile
cp .env.example .env      # EXPO_PUBLIC_API_URL con la IP que muestra el backend al iniciar
npm install
npx expo start
```
Escanear el código QR con Expo Go. El celular y la PC deben estar en la misma red Wi-Fi y el firewall de Windows debe permitir el puerto 4000.

### 3. Panel web
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 4. Agrupamiento K-Means
```bash
cd backend/ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Luego se ejecuta desde el panel (**Ejecutar agrupamiento K-Means**) o por consola con `python cluster_service.py -k 3`.
