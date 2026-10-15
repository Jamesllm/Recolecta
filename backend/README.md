# Recolecta+ | Backend API REST & Módulo de IA

Backend de **Recolecta+**, compuesto por:
1. **API REST en Node.js + Express**: cuentas de vecinos, reportes georreferenciados con foto (PostgreSQL + PostGIS y Amazon S3) e incidentes para el panel municipal.
2. **Módulo de IA en Python**: agrupamiento espacial K-Means de los reportes pendientes.

---

## 📁 Estructura del Proyecto

```text
backend/
├── .env.example                     # Plantilla de variables de entorno
├── package.json                     # Dependencias y scripts (dev, start, db:init)
├── server.js                        # Punto de entrada: valida configuración, BD y almacenamiento
├── app.js                           # Express, CORS y middlewares
├── database/
│   ├── schema.sql                   # Ubigeo, users, incidents y clusters (PostGIS, índices GiST)
│   └── ubigeo/                      # departamentos.json, provincias.json y distritos.json
├── scripts/
│   └── initDb.js                    # Crea la base, aplica schema.sql y carga el ubigeo
├── src/
│   ├── config/db.js                 # Pool de conexión pg y verificación de PostGIS
│   ├── controllers/
│   │   ├── authController.js        # Registro, inicio de sesión y perfil (US-01)
│   │   ├── reportController.js      # Reportes con foto y GPS, reportes cercanos (US-02, US-03)
│   │   ├── incidentController.js    # Incidentes para el panel municipal
│   │   └── clusterController.js     # Clústeres K-Means y ejecución del servicio Python
│   ├── middlewares/
│   │   ├── auth.js                  # JWT (Authorization: Bearer)
│   │   └── errorHandler.js          # Errores 404 / 500 / PostGIS
│   ├── routes/                      # /api/register, /api/login, /api/me, /api/reports, /api/incidents, /api/clusters
│   └── services/storage.js          # Fotos en Amazon S3 (URLs firmadas) o en disco para desarrollo
└── ai/
    ├── requirements.txt             # psycopg2, pandas, scikit-learn, numpy, python-dotenv
    └── cluster_service.py           # K-Means sobre los reportes pendientes
```

---

## 🛠️ Requisitos Previos

- **Node.js** 18 o superior (recomendado 20+)
- **Python** 3.11 o superior
- **PostgreSQL** 14+ con **PostGIS** (en Windows: *Stack Builder → Spatial Extensions → PostGIS*)
- Un bucket de **Amazon S3** para las fotos (ver más abajo)

---

## ⚙️ 1. Configuración

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (4000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a PostgreSQL (o `DATABASE_URL`, p. ej. Neon) |
| `CORS_ORIGINS` | Orígenes web permitidos (el panel corre en `http://localhost:3000`) |
| `JWT_SECRET` | Cadena aleatoria de 32 caracteres o más |
| `STORAGE_DRIVER` | `s3` (Amazon S3) o `local` (carpeta `uploads/`, solo desarrollo) |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` | Credenciales de S3 |
| `PYTHON_BIN` | Opcional: intérprete de Python para K-Means (por defecto `ai/venv`) |

**Amazon S3:** el bucket puede ser privado (se recomienda bloquear el acceso público). La API sube cada foto con `PutObject` y entrega URLs firmadas de 1 hora con `GetObject`, así que el usuario IAM solo necesita los permisos `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::<bucket>/reports/*`.

---

## 🗄️ 2. Base de datos

```bash
npm install
npm run db:init
```

`db:init` crea la base `recolecta_plus` si no existe, aplica `database/schema.sql` y carga el ubigeo (25 departamentos, 195 provincias y 1846 distritos) desde `database/ubigeo/`. Se puede ejecutar varias veces: actualiza los nombres sin duplicar filas.
- Extensión `postgis` y tipos `incident_status`, `cluster_status` y `user_role`.
- `departamentos`, `provincias` y `distritos`: ubigeo del Perú.
- `users`: vecinos y gestores (correo único, contraseña con bcrypt y `ubigeo` del distrito).
- `incidents`: reportes con `location GEOMETRY(Point, 4326)`, clave de la foto en S3, categoría, tamaño, dirección y precisión GPS.
- `clusters`: centroides calculados por K-Means.

---

## 🚀 3. Ejecución

```bash
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

Al iniciar, el servidor valida `JWT_SECRET`, la conexión con PostGIS y el almacenamiento de fotos, y muestra la dirección que debe usar la app móvil:

```text
 Servidor Express escuchando activamente en el puerto 4000
   - App móvil (misma red Wi-Fi): http://192.168.x.x:4000/api
```

---

## 📡 4. Endpoints

Prefijo base: `http://localhost:4000/api`. Los endpoints marcados con 🔒 requieren `Authorization: Bearer <token>`.
Los marcados con 👤 aceptan la sesión **o** el modo invitado: la app envía siempre `X-Device-Id` (UUID anónimo del teléfono), que identifica los reportes y confirmaciones del invitado.

### Cuentas (US-01)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | `{ full_name, email, password, ubigeo, accept_terms }` (`ubigeo`: código de 6 dígitos del distrito). Contraseña de 8+ caracteres con letra y número. Responde `201` con `{ user, token }` o `409` si el correo existe. |
| POST | `/login` | `{ email, password }` → `{ user, token }` (JWT de 7 días). |
| GET 🔒 | `/me` | Datos del usuario de la sesión. |

### Ubigeo
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/ubigeo/departamentos` | Departamentos del Perú. |
| GET | `/ubigeo/departamentos/:id/provincias` | Provincias de un departamento. |
| GET | `/ubigeo/provincias/:id/distritos` | Distritos de una provincia (el `id` es el ubigeo). |

### Reportes de la app del vecino (US-02 y US-03)
| Método | Ruta | Descripción |
|---|---|---|
| POST 👤 | `/reports` | `multipart/form-data`: `photo` (JPG/PNG/WEBP/HEIC, máx. 8 MB), `latitude`, `longitude`, `gps_accuracy_m?`, `address?`, `reference?` (≤ 140), `category` (`Orgánico`, `Inorgánico`, `Escombros`, `Peligroso`), `estimated_size` (`small`, `medium`, `large`), `description?` (≤ 280). Guarda la foto en S3 y el punto en PostGIS con estado `pending`; responde el código de seguimiento (`RL-0001`). Los invitados tienen un límite de 10 reportes por hora e IP. |
| GET 👤 | `/reports/nearby?lat=&lng=&radius=500&status=` | Reportes dentro del radio en metros (`ST_DWithin` sobre `geography`, máx. 5000), ordenados por distancia, con `title`, `urgency`, `critical` y `confirmations`. |
| GET 👤 | `/reports/mine` | Reportes de la cuenta y los enviados como invitado desde el teléfono. Al registrarse o iniciar sesión, los reportes del invitado pasan a la cuenta. |
| GET 👤 | `/reports/:id` | Detalle de un reporte. |
| POST 👤 | `/reports/:id/confirm` | «Sigue ahí»: suma una confirmación (una por cuenta y una por teléfono); no se permite en el propio reporte ni en uno resuelto. |

Reglas compartidas (`src/services/incidentRules.js`): urgencia **alta** si el residuo es `Peligroso` o `large` (camión completo), **media** si es `medium`, **baja** si es `small`; un reporte es **crítico** si está pendiente y tiene urgencia alta. La carga se **estima** por tamaño: 0,01 t, 0,1 t y 2 t.

### Panel municipal
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/incidents?status=&category=` | Reportes con nombre del vecino («Invitado» si no tiene cuenta), URL de la foto, urgencia, crítico, toneladas estimadas y confirmaciones. |
| GET | `/incidents/summary` | Indicadores del día (US-04): incidentes abiertos, críticos sin asignar, rutas activas (clústeres con reportes en ruta) y toneladas recolectadas hoy (estimadas). |
| PATCH | `/incidents/:id/status` | `{ status: 'pending' \| 'assigned' \| 'resolved' }`; al resolver guarda `resolved_at`. |
| GET | `/clusters` | Clústeres activos con sus reportes, zona (dirección más cercana al centroide) y toneladas estimadas. |
| POST | `/clusters/run` | `{ k }`: ejecuta `ai/cluster_service.py` sobre los reportes pendientes. |

> Los endpoints del panel todavía no exigen sesión de gestor; el inicio de sesión del panel corresponde a la US-10.

---

## 🤖 5. Módulo de IA (K-Means)

```bash
cd ai
python -m venv venv
venv\Scripts\activate          # Windows  (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt

python cluster_service.py -k 3             # agrupa y guarda en PostGIS
python cluster_service.py -k 3 --dry-run   # solo muestra el resultado
```

- Toma los reportes en estado `pending` (`ST_X`, `ST_Y`) y aplica **K-Means** de Scikit-Learn.
- Si hay menos reportes que K, ajusta K al número de reportes.
- Marca como `cleared` los clústeres anteriores, inserta los nuevos centroides y asocia cada reporte a su clúster en una sola transacción (con `ROLLBACK` ante errores).
- El panel lo ejecuta con `POST /api/clusters/run`, usando el intérprete de `ai/venv`.
