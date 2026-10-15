/**
 * Reglas de negocio de los reportes, compartidas por la app del vecino y el panel municipal
 * Módulo: src/services/incidentRules.js
 */

// Carga estimada por tamaño (toneladas). No se pesa el residuo: el panel la muestra como «estimada».
const TONS_BY_SIZE = { small: 0.01, medium: 0.1, large: 2 };

const CATEGORY_TITLE = {
  Orgánico: 'Residuos orgánicos',
  Inorgánico: 'Residuos inorgánicos',
  Escombros: 'Escombros',
  Peligroso: 'Residuos peligrosos',
};

/** Urgencia alta: residuo peligroso o de un camión completo; media: pila grande; baja: bolsa pequeña. */
const urgencyOf = ({ category, estimated_size }) => {
  if (estimated_size === 'large' || category === 'Peligroso') return 'high';
  return estimated_size === 'medium' ? 'medium' : 'low';
};

/** Crítico: pendiente (sin asignar) y de urgencia alta. */
const isCritical = (row) => row.status === 'pending' && urgencyOf(row) === 'high';

const tonsOf = ({ estimated_size }) => TONS_BY_SIZE[estimated_size] ?? 0;

const titleOf = ({ category }) => CATEGORY_TITLE[category] || category;

/** Suma de toneladas con dos decimales. */
const sumTons = (rows) => Math.round(rows.reduce((sum, r) => sum + tonsOf(r), 0) * 100) / 100;

module.exports = { TONS_BY_SIZE, urgencyOf, isCritical, tonsOf, titleOf, sumTons };
