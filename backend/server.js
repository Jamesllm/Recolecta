/**
 * Punto de Entrada y Ejecución del Servidor - Recolecta+
 * Archivo: server.js
 */

require('dotenv').config();
const app = require('./app');
const os = require('os');
const { testConnection, pool } = require('./src/config/db');
const { checkStorageConfig } = require('./src/services/storage');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// Función para inicializar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor Recolecta+...');

    // 1. Validar configuración obligatoria, PostgreSQL/PostGIS y almacenamiento de fotos
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET no está definido en .env o tiene menos de 32 caracteres.');
    }
    await testConnection();
    console.log(`   - Fotos: ${checkStorageConfig()}`);

    // 2. Escuchar en el puerto configurado
    const server = app.listen(PORT, () => {
      console.log(` Servidor Express escuchando activamente en el puerto ${PORT}`);
      console.log(`   - Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   - Endpoint Health: http://localhost:${PORT}/api/health`);
      console.log(`   - Endpoints Incidentes: http://localhost:${PORT}/api/incidents`);
      // Direcciones de la red local para configurar EXPO_PUBLIC_API_URL en la app móvil
      for (const nets of Object.values(os.networkInterfaces())) {
        for (const net of nets || []) {
          if (net.family === 'IPv4' && !net.internal) console.log(`   - App móvil (misma red Wi-Fi): http://${net.address}:${PORT}/api`);
        }
      }
    });

    // 3. Manejo de señales de terminación segura (Graceful Shutdown)
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor de forma ordenada...`);
      server.close(async () => {
        console.log('  - Servidor HTTP cerrado.');
        try {
          await pool.end();
          console.log('  - Pool de conexiones a PostgreSQL cerrado.');
          process.exit(0);
        } catch (dbErr) {
          console.error('  - Error cerrando el pool de PostgreSQL:', dbErr.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Fallo fatal al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
