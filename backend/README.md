# Recolecta+ | Backend API REST & Módulo de IA

Backend para la plataforma **Recolecta+**, compuesto por:
1. **API REST en Node.js + Express**: Gestión de incidentes de residuos georreferenciados con PostgreSQL y extensión espacial PostGIS.
2. **Módulo de IA en Python**: Microservicio autónomo para clustering geoespacial (K-Means) sobre PostGIS para optimización de recojo y rutas.

---

## 📁 Estructura del Proyecto

```text
backend/
├── .env.example                     # Plantilla de variables de entorno para la API
├── package.json                     # Dependencias de Node.js y scripts
├── server.js                        # Punto de entrada y orquestación del servidor HTTP
├── app.js                           # Configuración de Express, CORS y middlewares
├── database/
│   └── schema.sql                   # DDL de PostgreSQL con PostGIS e índices espaciales
├── src/
│   ├── config/
│   │   └── db.js                    # Pool de conexión pg con PostgreSQL y healthcheck PostGIS
│   ├── controllers/
│   │   └── incidentController.js    # Controlador con queries PostGIS (ST_MakePoint, ST_X, ST_Y)
│   ├── routes/
│   │   ├── incidentRoutes.js        # Endpoints de incidentes (/api/incidents)
│   │   └── index.js                 # Enrutador principal y endpoint /api/health
│   └── middlewares/
│       └── errorHandler.js          # Manejador global de errores (404, 500, PostGIS)
└── ai/
    ├── .env.example                 # Variables de entorno para el servicio Python
    ├── requirements.txt             # Dependencias Python (psycopg2, pandas, scikit-learn)
    └── cluster_service.py           # Script autónomo de clustering K-Means sobre PostGIS
```

---

## 🛠️ Requisitos Previos

- **Node.js**: v18.x o superior (recomendado v20+)
- **Python**: v3.11 o superior
- **PostgreSQL**: v14+ con extensión **PostGIS** habilitada

---

## 🗄️ 1. Configuración de Base de Datos (PostgreSQL + PostGIS)

1. Crear la base de datos en PostgreSQL:
   ```bash
   createdb -U postgres recolecta_plus
   ```

2. Ejecutar el script DDL para habilitar la extensión espacial y crear las tablas:
   ```bash
   psql -U postgres -d recolecta_plus -f database/schema.sql
   ```

El script inicializará:
- Extensión `postgis`.
- Tipos ENUM `incident_status` (`pending`, `assigned`, `resolved`) y `cluster_status`.
- Tabla `clusters` con columna espacial `centroid GEOMETRY(Point, 4326)` e índice GiST.
- Tabla `incidents` con columna espacial `location GEOMETRY(Point, 4326)` e índice GiST.

---

## 🚀 2. Ejecución del Servidor Backend (Node.js + Express)

### Variables de Entorno
Copia el archivo `.env.example` como `.env` en la carpeta `backend/`:
```bash
cp .env.example .env
```
Asegúrate de configurar los valores de conexión:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=recolecta_plus
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Orígenes permitidos por CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8081,exp://localhost:8081
```

### Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor validará la conexión y extensión PostGIS al iniciar:
```text
🚀 Iniciando servidor Recolecta+...
 Conexión a PostgreSQL establecida con éxito.
   - Base de datos: recolecta_plus
   - PostGIS: Activo
 Servidor Express escuchando activamente en el puerto 3000
```

---

## 📡 Endpoints de la API REST

Prefijo base: `http://localhost:3000/api`

### Health Check
- **GET** `/api/health`
  - Retorna el estado operativo del servicio.

### Incidentes (`/api/incidents`)

#### 1. Registrar Nuevo Incidente
- **POST** `/api/incidents`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "user_id": "usr_12345",
    "photo_url": "https://storage.recolecta.pe/photos/inc_1.jpg",
    "category": "Basura acumulada",
    "estimated_size": "medium",
    "description": "Bolsas de residuos en la esquina del parque",
    "latitude": -12.046374,
    "longitude": -77.042793
  }
  ```
- **PostGIS interno**: `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`
- **Respuesta** (201 Created):
  ```json
  {
    "success": true,
    "message": "Incidente registrado exitosamente.",
    "data": {
      "id": 1,
      "user_id": "usr_12345",
      "category": "Basura acumulada",
      "estimated_size": "medium",
      "description": "Bolsas de residuos en la esquina del parque",
      "photo_url": "https://storage.recolecta.pe/photos/inc_1.jpg",
      "status": "pending",
      "longitude": -77.042793,
      "latitude": -12.046374,
      "created_at": "2026-09-20T18:30:00.000Z",
      "updated_at": "2026-09-20T18:30:00.000Z"
    }
  }
  ```

#### 2. Consultar Incidentes
- **GET** `/api/incidents`
- **Query Params opcionales**:
  - `status`: `pending` | `assigned` | `resolved`
  - `category`: ej. `Basura acumulada`
- **PostGIS interno**: Proyecta decimales nativos mediante `ST_X(location::geometry)` y `ST_Y(location::geometry)`.
- **Respuesta** (200 OK):
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": 1,
        "user_id": "usr_12345",
        "category": "Basura acumulada",
        "status": "pending",
        "longitude": -77.042793,
        "latitude": -12.046374,
        "cluster_id": null,
        "created_at": "2026-09-20T18:30:00.000Z"
      }
    ]
  }
  ```

#### 3. Actualizar Estado de un Incidente
- **PATCH** `/api/incidents/:id/status`
- **Body**:
  ```json
  {
    "status": "assigned"
  }
  ```
- **Valores permitidos**: `"pending"`, `"assigned"`, `"resolved"`.
- **Respuesta** (200 OK):
  ```json
  {
    "success": true,
    "message": "El estado del incidente #1 ha sido actualizado a 'assigned'.",
    "data": {
      "id": 1,
      "status": "assigned",
      "updated_at": "2026-09-20T18:35:00.000Z"
    }
  }
  ```

---

## 🤖 3. Módulo de IA y Clustering Geoespacial (Python)

El script `ai/cluster_service.py` es un microservicio batch/worker autónomo que agrupa incidentes pendientes y calcula centroides para rutas óptimas de recolección.

### Instalación de Dependencias Python
```bash
cd ai

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
# source venv/bin/activate

# Instalar librerías
pip install -r requirements.txt
```

### Ejecución del Script de Clustering
```bash
# Ejecución estándar (K=3 por defecto)
python cluster_service.py

# Especificar número de clústeres K deseados
python cluster_service.py -k 5

# Modo Simulación (sin escribir en base de datos)
python cluster_service.py -k 3 --dry-run
```

### Características del Módulo de IA:
- **Consulta PostGIS**: Extrae longitud (`ST_X`) y latitud (`ST_Y`) de incidentes en estado `pending`.
- **Manejo de Casos Borde**:
  - Si no hay puntos: finaliza con log explicativo sin arrojar error.
  - Si hay menos puntos que $K$ ($N < K$): ajusta dinámicamente $K = N$ evitando fallos de Scikit-Learn.
- **Persistencia Transaccional**:
  - Inserta los centroides calculados en la tabla `clusters` con `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.
  - Asocia a cada incidente pendiente su respectivo `cluster_id`.
  - Realiza `ROLLBACK` automático ante cualquier error inesperado.
