-- Script de Inicialización de Base de Datos para Recolecta+
-- Habilitar extensión PostGIS para georreferenciación espacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tipos ENUM para incidentes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE incident_status AS ENUM ('pending', 'assigned', 'resolved');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cluster_status') THEN
        CREATE TYPE cluster_status AS ENUM ('active', 'in_progress', 'cleared');
    END IF;
END $$;

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

-- Tabla de Incidentes Reportados
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    photo_url TEXT,
    category VARCHAR(100) NOT NULL,
    estimated_size VARCHAR(50),
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    status incident_status DEFAULT 'pending',
    cluster_id INTEGER REFERENCES clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices espaciales y de consulta para incidents
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_cluster_id ON incidents (cluster_id);
