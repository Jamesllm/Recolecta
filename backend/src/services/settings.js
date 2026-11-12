/**
 * Configuración del panel municipal (pantalla A8 · Configuración, US-10)
 * Módulo: src/services/settings.js
 *
 * Se guarda en la tabla settings (clave → valor JSON). Las claves que no están en la tabla usan su valor por defecto.
 */

const { query } = require('../config/db');

const DEFINITIONS = {
  // Parámetros de la IA (K-Means)
  clusters_k_max: { default: 8, validate: (v) => Number.isInteger(v) && v >= 2 && v <= 15, error: 'El K máximo debe ser un número entero entre 2 y 15.' },
  clusters_weighted: { default: true, validate: (v) => typeof v === 'boolean', error: 'Indique si se pondera por carga (sí o no).' },
  // Reglas de automatización
  notify_email_on_resolved: { default: true, validate: (v) => typeof v === 'boolean', error: 'Indique si se avisa por correo (sí o no).' },
  welcome_email: { default: true, validate: (v) => typeof v === 'boolean', error: 'Indique si se envía el correo de bienvenida (sí o no).' },
  // Base de la flota: punto de salida de los camiones en el recorrido simulado (null: salen de la primera parada)
  fleet_base: {
    default: null,
    validate: (v) =>
      v === null ||
      (typeof v === 'object' &&
        Number.isFinite(v.latitude) && Math.abs(v.latitude) <= 90 &&
        Number.isFinite(v.longitude) && Math.abs(v.longitude) <= 180 &&
        (v.label === undefined || (typeof v.label === 'string' && v.label.length <= 80))),
    error: 'Elija la base de la flota en el mapa (y un nombre de hasta 80 caracteres).',
  },
};

const defaults = () => Object.fromEntries(Object.entries(DEFINITIONS).map(([k, d]) => [k, d.default]));

/** Configuración completa (valores guardados sobre los valores por defecto). */
const getSettings = async () => {
  const result = await query('SELECT key, value FROM settings WHERE key = ANY($1::text[])', [Object.keys(DEFINITIONS)]);
  return { ...defaults(), ...Object.fromEntries(result.rows.map((r) => [r.key, r.value])) };
};

/**
 * Guarda los valores recibidos. Devuelve { errors } si alguno no es válido, o { settings } con la configuración final.
 */
const updateSettings = async (patch) => {
  const errors = {};
  const entries = Object.entries(patch || {}).filter(([k]) => DEFINITIONS[k]);
  for (const [k, v] of entries) if (!DEFINITIONS[k].validate(v)) errors[k] = DEFINITIONS[k].error;
  if (Object.keys(errors).length) return { errors };
  for (const [k, v] of entries) {
    await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [k, JSON.stringify(v)]
    );
  }
  return { settings: await getSettings() };
};

module.exports = { getSettings, updateSettings, DEFINITIONS };
