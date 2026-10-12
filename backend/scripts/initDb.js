/**
 * Crea la base de datos (si no existe), aplica database/schema.sql y carga el ubigeo.
 * Uso: npm run db:init
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};
const dbName = process.env.DB_NAME || 'recolecta_plus';
const UBIGEO_DIR = path.join(__dirname, '..', 'database', 'ubigeo');

// Algunos nombres vienen con entidades HTML (p. ej. «FERRE&#209;AFE»)
const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .trim();

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(UBIGEO_DIR, `${name}.json`), 'utf8'));

/** Inserta o actualiza filas en bloques con una sola consulta por bloque. */
async function upsert(db, table, cols, key, rows) {
  const size = 500;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const values = [];
    const tuples = chunk.map((r, j) => `(${cols.map((_, k) => `$${j * cols.length + k + 1}`).join(', ')})`);
    chunk.forEach((r) => values.push(...r));
    const updates = cols.filter((c) => c !== key).map((c) => `${c} = EXCLUDED.${c}`).join(', ');
    await db.query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES ${tuples.join(', ')} ON CONFLICT (${key}) DO UPDATE SET ${updates}`, values);
  }
}

(async () => {
  const admin = new Client({ ...cfg, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rowCount) {
    await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '')}"`);
    console.log(`Base de datos ${dbName} creada.`);
  } else {
    console.log(`Base de datos ${dbName} ya existe.`);
  }
  await admin.end();

  const db = new Client({ ...cfg, database: dbName });
  await db.connect();
  await db.query(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
  const { rows } = await db.query('SELECT postgis_lib_version() AS v');
  console.log(`Esquema aplicado. PostGIS ${rows[0].v}.`);

  await db.query('BEGIN');
  await upsert(db, 'departamentos', ['id_departamento', 'nombre'], 'id_departamento',
    readJson('departamentos').map((d) => [d.id_departamento, decode(d.nombre)]));
  await upsert(db, 'provincias', ['id_provincia', 'id_departamento', 'nombre'], 'id_provincia',
    readJson('provincias').map((p) => [p.id_provincia, p.id_departamento, decode(p.nombre)]));
  await upsert(db, 'distritos', ['ubigeo', 'id_provincia', 'nombre'], 'ubigeo',
    readJson('distritos').map((d) => [d.ubigeo, d.id_provincia, decode(d.nombre)]));
  await db.query('COMMIT');

  // Migración: cuentas creadas con el distrito como texto libre pasan al código de ubigeo
  const legacy = await db.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'district'");
  if (legacy.rowCount) {
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ubigeo CHAR(6) REFERENCES distritos(ubigeo)');
    // Solo se asigna cuando el nombre coincide con un único distrito
    await db.query(`
      UPDATE users u SET ubigeo = m.ubigeo
      FROM (
        SELECT u2.id, MIN(d.ubigeo) AS ubigeo
        FROM users u2
        JOIN distritos d ON translate(upper(d.nombre), 'ÁÉÍÓÚÜ', 'AEIOUU') = translate(upper(trim(u2.district)), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUAEIOUU')
        GROUP BY u2.id HAVING COUNT(*) = 1
      ) m
      WHERE u.id = m.id AND u.ubigeo IS NULL`);
    const pending = await db.query('SELECT id, district FROM users WHERE ubigeo IS NULL');
    if (pending.rowCount) {
      console.warn('Usuarios cuyo distrito no se pudo asignar (corregir a mano):', pending.rows);
    } else {
      await db.query('ALTER TABLE users ALTER COLUMN ubigeo SET NOT NULL');
      await db.query('ALTER TABLE users DROP COLUMN district');
      console.log('Usuarios existentes migrados al código de ubigeo.');
    }
  }

  const count = await db.query('SELECT (SELECT COUNT(*) FROM departamentos) AS dep, (SELECT COUNT(*) FROM provincias) AS prov, (SELECT COUNT(*) FROM distritos) AS dist');
  const c = count.rows[0];
  console.log(`Ubigeo cargado: ${c.dep} departamentos, ${c.prov} provincias y ${c.dist} distritos.`);
  await db.end();
})().catch((err) => {
  console.error('No se pudo inicializar la base de datos:', err.message);
  process.exit(1);
});
