/**
 * Configuración y Pool de Conexión a PostgreSQL con soporte PostGIS
 * Módulo: src/config/db.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexiones usando variables de entorno
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'recolecta_plus',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20, // Máximo de conexiones concurrentes en el pool
      idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexión inactiva (30s)
      connectionTimeoutMillis: 5000, // Tiempo máximo de espera para obtener conexión (5s)
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

// Manejador global de errores inesperados en clientes inactivos del pool
pool.on('error', (err, client) => {
  console.error('[DB Pool Error] Error inesperado en el cliente inactivo de PostgreSQL:', err.message);
});

/**
 * Valida la conexión inicial a PostgreSQL y comprueba la disponibilidad de PostGIS.
 * @returns {Promise<boolean>} Retorna true si la conexión y PostGIS están activos.
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Validar conexión básica y versión de PostGIS
    const result = await client.query(`
      SELECT 
        NOW() AS server_time, 
        current_database() AS database_name,
        postgis_full_version() AS postgis_version;
    `);

    const { server_time, database_name, postgis_version } = result.rows[0];

    console.log(' Conexión a PostgreSQL establecida con éxito.');
    console.log(`   - Base de datos: ${database_name}`);
    console.log(`   - Hora del servidor: ${server_time}`);
    console.log(`   - PostGIS: ${postgis_version ? 'Activo' : 'No detectado'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error crítico al conectar con PostgreSQL/PostGIS:');
    console.error(`   - Mensaje: ${error.message}`);
    console.error('   - Verifique que las credenciales en .env sean correctas y que el servicio PostgreSQL esté en ejecución.');
    throw error;
  } finally {
    if (client) client.release();
  }
};

/**
 * Función helper para ejecutar consultas SQL parametrizadas.
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<any>} Resultado de la consulta pg
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
  testConnection,
};
