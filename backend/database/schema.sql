-- Script de Inicialización de Base de Datos para Recolecta+
-- Habilitar extensión PostGIS para georreferenciación espacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tipos ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE incident_status AS ENUM ('pending', 'assigned', 'resolved');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cluster_status') THEN
        CREATE TYPE cluster_status AS ENUM ('active', 'in_progress', 'cleared');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('citizen', 'manager');
    END IF;
END $$;

-- Ubigeo del Perú (INEI): se carga desde database/ubigeo/*.json con npm run db:init
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento CHAR(2) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS provincias (
    id_provincia CHAR(4) PRIMARY KEY,
    id_departamento CHAR(2) NOT NULL REFERENCES departamentos(id_departamento),
    nombre VARCHAR(80) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provincias_departamento ON provincias (id_departamento);

CREATE TABLE IF NOT EXISTS distritos (
    ubigeo CHAR(6) PRIMARY KEY,
    id_provincia CHAR(4) NOT NULL REFERENCES provincias(id_provincia),
    nombre VARCHAR(80) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_distritos_provincia ON distritos (id_provincia);

-- Usuarios (US-01): ciudadanos que reportan y gestores municipales
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash TEXT NOT NULL,
    ubigeo CHAR(6) NOT NULL REFERENCES distritos(ubigeo),
    role user_role NOT NULL DEFAULT 'citizen',
    terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- El correo es único sin distinguir mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- Tabla de Clústeres Espaciales (generados por el módulo de IA)
CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    incident_count INTEGER DEFAULT 0,
    status cluster_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice espacial para clusters
CREATE INDEX IF NOT EXISTS idx_clusters_centroid ON clusters USING GIST (centroid);

-- Reportes ciudadanos (US-02). En el panel se gestionan como «incidentes».
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_key TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    estimated_size VARCHAR(50) NOT NULL,
    description VARCHAR(280),
    address TEXT,
    gps_accuracy_m REAL,
    location GEOMETRY(Point, 4326) NOT NULL,
    status incident_status DEFAULT 'pending',
    cluster_id INTEGER REFERENCES clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices espaciales y de consulta para incidents
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST (location);
-- Búsquedas por radio en metros (US-03) con ST_DWithin sobre geography
CREATE INDEX IF NOT EXISTS idx_incidents_location_geog ON incidents USING GIST ((location::geography));
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_cluster_id ON incidents (cluster_id);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents (user_id);
