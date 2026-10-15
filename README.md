# Recolecta+

[![Status](https://img.shields.io/badge/Status-Active-2563EB?style=for-the-badge)](https://github.com/Jamesllm/Recolecta)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial_Engine-2E8540?style=for-the-badge)](https://postgis.net/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-Cross_Platform-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-K--Means_ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Plataforma integral, distribuida y georreferenciada para la fiscalizacion comunitaria, monitoreo en tiempo real y optimizacion inteligente de rutas de recoleccion de residuos solidos urbanos.

---

## Indice de Contenidos

- [Contexto del Proyecto](#contexto-del-proyecto)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modulos y Componentes](#modulos-y-componentes)
- [Entregables del Sprint 1](#entregables-del-sprint-1)
- [Requisitos de Infraestructura](#requisitos-de-infraestructura)
- [Guia de Instalacion y Despliegue](#guia-de-instalacion-y-despliegue)
- [Especificacion de la API REST](#especificacion-de-la-api-rest)
- [Motor de Inteligencia Artificial](#motor-de-inteligencia-artificial)
- [Estandares de Seguridad y Calidad](#estandares-de-seguridad-y-calidad)

---

## Contexto del Proyecto

Proyecto desarrollado en el marco de la asignatura **Innovacion y Transformacion Digital** (Periodo Academico 2026-2) en la Universidad Tecnologica del Peru (UTP).

### Equipo de Ingenieria (Grupo 3)

| Rol | Nombre y Apellidos |
|:---|:---|
| Product Owner | Ronal James Llapapasca Montes |
| Scrum Master | Carlos Andres Bustamante Suclupe |
| Lead Developer | Danna Jael Minan Gonzalez |
| Core Developer | Victor Miguel Alonso Reyes Flores |
| QA & Cloud Specialist | Angel Eduardo Salas Bances |

---

## Arquitectura del Sistema

El ecosistema opera bajo un patron de arquitectura desacoplada y orientada a servicios, dividida en cuatro capas especializadas:

```mermaid
graph TD
    subgraph Capa de Usuario
        A1[App Ciudadana Móvil / Web<br/>Expo SDK 57 / React Native]
        A2[Command Center Municipal<br/>Next.js 16 / Tailwind CSS]
    end

    subgraph Capa de Servicios y API
        B1[API REST Gateway<br/>Node.js / Express]
        B2[Middleware de Autenticación<br/>JWT & RBAC]
    end

    subgraph Capa de Analítica e IA
        C1[Microservicio K-Means<br/>Python / Scikit-Learn]
    end

    subgraph Capa de Persistencia y Almacenamiento
        D1[(PostgreSQL 14+ con PostGIS<br/>Índices Espaciales GiST)]
        D2[(Amazon S3 Storage<br/>URLs Firmadas de Fotos)]
    end

    A1 -->|HTTPS / JSON / Multipart| B1
    A2 -->|HTTPS / JSON| B1
    B1 --> B2
    B2 --> D1
    B1 -->|Carga de Fotos| D2
    B1 -->|Procesamiento de Clústeres| C1
    C1 -->|Lectura de Puntos / Asignación| D1
```

---

## Modulos y Componentes

| Modulo | Directorio | Pila Tecnologica | Proposito |
|:---|:---|:---|:---|
| **App Ciudadana** | [`mobile/`](mobile/) | React Native, Expo SDK 57, Expo Router, Leaflet, OpenStreetMap | Registro vecinal, geolocalizacion asistida, captura de evidencia fotografica, consulta de reportes en radio de 500 m. |
| **API Backend** | [`backend/`](backend/) | Node.js 20+, Express, PostgreSQL, PostGIS, JWT, AWS SDK | Logica de negocio central, endpoints transaccionales, consultas espaciales en WGS84 (`SRID 4326`), validacion de ubigeo nacional. |
| **Motor de IA** | [`backend/ai/`](backend/ai/) | Python 3.11+, Scikit-Learn, Pandas, NumPy, Psycopg2 | Clustering espacial K-Means no supervisado de focos criticos y secuenciamiento de paradas de recoleccion. |
| **Centro de Mando** | [`frontend/`](frontend/) | Next.js 16 (App Router), TypeScript, Tailwind CSS, React-Leaflet | Monitoreo operacional de cuadrillas, mapas de calor, tracking de camiones recolectores y administracion de incidentes. |

---

## Entregables del Sprint 1

Periodo de ejecucion: **10 al 17 de octubre de 2026**.

| Historia de Usuario | Descripcion Funcional | Capa de Implementacion |
|:---|:---|:---|
| `US-01` **Registro y Sesion de Ciudadano** | Registro con validacion formal de credenciales y asociacion a ubigeo territorial (departamento, provincia, distrito). Persistencia de sesion segura en dispositivos nativos y navegador web. | `mobile/`, `POST /api/register`, `POST /api/login`, `GET /api/me` |
| `US-02` **Reporte de Residuos con Foto y GPS** | Captura o seleccion de foto, compresion automatica de imagen, geolocalizacion GPS con ajuste manual en mapa, categorizacion y persistencia en Amazon S3 y PostGIS. | `mobile/`, `POST /api/reports` |
| `US-03` **Mapa de Puntos Cercanos** | Visualizacion geoespacial de incidentes en un radio dinamico de 500 m, filtrado por estados (`pending`, `assigned`, `resolved`) y deteccion preventiva de duplicados. | `mobile/`, `GET /api/reports/nearby` |

Prototipo de diseno UI/UX validado: [Prototipo en Figma](https://www.figma.com/proto/ay8UeV1wq2jKnHS90bKZz3/Recolecta-?node-id=25-5&t=aOT8hrXgXpSaUAUk-1).

---

## Requisitos de Infraestructura

- **Node.js**: Version 18.0.0 o superior (recomendado 20.x LTS).
- **Python**: Version 3.11 o superior.
- **PostgreSQL**: Version 14 o superior con extension espacial **PostGIS** habilitada.
- **Amazon S3**: Bucket configurado con credenciales de acceso o emulacion compatible S3.
- **Entorno de ejecucion movil**: Expo Go instalado en dispositivo movil fisico (Android o iOS) o emulador de navegador web.

---

## Guia de Instalacion y Despliegue

### 1. Configuracion del Backend y Base de Datos

```bash
# Acceder al directorio backend
cd backend

# Duplicar y configurar variables de entorno
cp .env.example .env

# Instalar dependencias del servidor
npm install

# Inicializar esquema de base de datos, extension PostGIS y ubigeo oficial
npm run db:init

# Iniciar servidor en modo desarrollo
npm run dev
```

El servidor quedara activo en `http://localhost:4000/api`.

### 2. Configuracion de la Aplicacion Movil (Ciudadano)

```bash
# Acceder al directorio mobile
cd mobile

# Configurar direccion IP del servidor
cp .env.example .env

# Instalar paquetes dependientes
npm install

# Iniciar Metro Bundler
npx expo start
```

- Para ejecucion en dispositivo movil: escanear el codigo QR mediante la aplicacion **Expo Go** (ambos dispositivos en la misma red Wi-Fi).
- Para ejecucion web en navegador: presionar la tecla `w` en la consola interactiva de Expo (`http://localhost:8081`).

### 3. Configuracion del Centro de Mando Web (Municipalidad)

```bash
# Acceder al directorio frontend
cd frontend

# Configurar variables locales
cp .env.example .env.local

# Instalar dependencias
npm install

# Iniciar servidor Next.js
npm run dev
```

La consola administrativa estara disponible en `http://localhost:3000`.

### 4. Configuracion del Servicio de Clustering IA

```bash
# Acceder al entorno del modulo de IA
cd backend/ai

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias de computo cientifico
pip install -r requirements.txt

# Ejecucion manual del pipeline de agrupamiento
python cluster_service.py -k 3
```

---

## Especificacion de la API REST

### Autenticacion y Territorio

| Metodo | Endpoint | Descripcion | Autenticacion |
|:---|:---|:---|:---:|
| `POST` | `/api/register` | Registro de nuevo ciudadano con ubigeo | No |
| `POST` | `/api/login` | Autenticacion de usuario y emision de token JWT | No |
| `GET` | `/api/me` | Informacion del usuario autenticado | Requerida |
| `GET` | `/api/ubigeo/departamentos` | Catalogo nacional de departamentos | No |
| `GET` | `/api/ubigeo/departamentos/:id/provincias` | Provincias segun departamento | No |
| `GET` | `/api/ubigeo/provincias/:id/distritos` | Distritos segun provincia | No |

### Reportes e Incidentes

| Metodo | Endpoint | Descripcion | Autenticacion |
|:---|:---|:---|:---:|
| `POST` | `/api/reports` | Creacion de reporte georreferenciado con imagen multipart | Requerida |
| `GET` | `/api/reports/nearby` | Consulta geoespacial de incidentes en radio metrico (ST_DWithin) | Requerida |
| `GET` | `/api/reports/mine` | Listado historico de reportes emitidos por el vecino autenticado | Requerida |
| `GET` | `/api/reports/:id` | Detalle estructurado de un incidente individual | Requerida |
| `GET` | `/api/incidents` | Listado consolidado para el panel municipal con filtros | Requerida |
| `PATCH` | `/api/incidents/:id/status` | Transicion de estado de atencion de incidente | Requerida |

### Analitica y Rutas

| Metodo | Endpoint | Descripcion | Autenticacion |
|:---|:---|:---|:---:|
| `GET` | `/api/clusters` | Obtencion de agrupaciones espaciales calculadas | Requerida |
| `POST` | `/api/clusters/run` | Disparo bajo demanda del clustering K-Means | Requerida |

---

## Motor de Inteligencia Artificial

El servicio ubicado en `backend/ai/cluster_service.py` aplica el algoritmo de aprendizaje no supervisado **K-Means** sobre las coordenadas geograficas proyectadas en WGS84 de todos los reportes en estado `pending`.

1. **Extraccion**: Consulta a PostgreSQL filtrando puntos pendientes en el distrito seleccionado.
2. **Transformacion Matricial**: Construccion de la matriz de caracteristicas espaciales bidimensionales (`latitude`, `longitude`).
3. **Optimizacion de Centroides**: Convergencia de centroides mediante optimizacion de distancias euclidianas directas minimizadas.
4. **Persistencia Transaccional**: Registro de los clústeres resultantes en la tabla `clusters` y asociacion masiva a cada registro de incidente.
5. **Ruta Heuristica**: Ordenamiento secuencial de puntos prioritarios orientado a maximizar el rendimiento de la flota recolectora municipal.

---

## Estandares de Seguridad y Calidad

- **Seguridad en Reposo y Transito**: Cifrado de contrasenas mediante `bcrypt` con factor de coste 10, autenticacion stateless con tokens `JWT` firmados con clave HMAC-SHA256 de alta entropia.
- **Rendimiento Geoespacial**: Consultas de proximidad optimizadas con funciones nativas de PostGIS (`ST_DWithin`, `ST_DistanceSphere`) soportadas por indices espaciales de arbol `GiST` sobre la columna `location`.
- **Politicas de CORS Robustas**: Control de acceso a recursos de origen cruzado parametrizado dinamicamente para consumo seguro desde clientes moviles nativos y dominios web autorizados.
- **Almacenamiento Concurrente**: Almacenamiento seguro de objetos multimedia en Amazon S3 mediante el uso de URLs pre-firmadas temporales, evitando la sobrecarga del servidor de aplicaciones.
