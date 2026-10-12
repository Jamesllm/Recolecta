/**
 * Almacenamiento de fotos de evidencia (REC-8)
 * Módulo: src/services/storage.js
 *
 * STORAGE_DRIVER=s3    → Amazon S3 (bucket privado; se entregan URLs firmadas temporales)
 * STORAGE_DRIVER=local → carpeta backend/uploads (solo para desarrollo sin credenciales)
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const DRIVER = (process.env.STORAGE_DRIVER || 's3').toLowerCase();
const LOCAL_DIR = path.join(__dirname, '..', '..', 'uploads');
const URL_TTL_SECONDS = 60 * 60;
const S3_VARS = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET'];

let s3 = null;
const getS3 = () => {
  if (!s3) {
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
    };

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    const endpoint = process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT_URL;
    if (endpoint) {
      config.endpoint = endpoint;
      config.forcePathStyle = true;
    }

    s3 = new S3Client(config);
  }
  return s3;
};

/** Verifica la configuración al iniciar el servidor. */
const checkStorageConfig = () => {
  if (DRIVER === 'local') {
    fs.mkdirSync(LOCAL_DIR, { recursive: true });
    return `local (${LOCAL_DIR})`;
  }
  if (DRIVER !== 's3') throw new Error(`STORAGE_DRIVER no válido: ${DRIVER}. Use "s3" o "local".`);
  const missing = S3_VARS.filter((v) => !process.env[v]);
  if (missing.length) throw new Error(`Faltan variables de Amazon S3 en .env: ${missing.join(', ')}`);
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT_URL;
  const target = endpoint ? `S3 compatible (${endpoint})` : 'Amazon S3';
  return `${target} (bucket ${process.env.S3_BUCKET}, región ${process.env.AWS_REGION})`;
};

/** Guarda la imagen y devuelve la clave con la que se registra en la base de datos. */
const saveImage = async (key, buffer, contentType) => {
  if (DRIVER === 'local') {
    const file = path.join(LOCAL_DIR, key);
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, buffer);
    return key;
  }
  await getS3().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return key;
};

/** URL para mostrar la imagen: firmada y temporal en S3, o servida por Express en local. */
const imageUrl = async (key, req) => {
  if (!key) return null;
  if (DRIVER === 'local') return `${req.protocol}://${req.get('host')}/uploads/${key}`;
  return getSignedUrl(getS3(), new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: URL_TTL_SECONDS });
};

module.exports = { DRIVER, LOCAL_DIR, checkStorageConfig, saveImage, imageUrl };
