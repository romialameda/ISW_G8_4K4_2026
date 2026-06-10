/**
 * actividadesData.js — Metadatos de UI para las actividades
 *
 * Los datos de negocio (cupos, horarios, T&C, requiereTalle) vienen del backend.
 * Este archivo solo tiene información visual que el backend no necesita conocer:
 *  emoji, color de tema y descripción de marketing.
 *
 * El frontend hace merge de estos metadatos con la respuesta de la API.
 */

export const UI_METADATA = {
  Tirolesa: {
    emoji: '🧗',
    color: '#4f46e5',
    descripcion: 'Deslizate por cables a gran altura sobre el paisaje natural del parque.',
  },
  Safari: {
    emoji: '🦁',
    color: '#d97706',
    descripcion: 'Recorrido en vehículo para observar la fauna autóctona en su hábitat natural.',
  },
  Palestra: {
    emoji: '🏔️',
    color: '#059669',
    descripcion: 'Escalada en roca artificial con supervisión de instructores certificados.',
  },
  Jardinería: {
    emoji: '🌿',
    color: '#7c3aed',
    descripcion: 'Taller de jardinería y contacto con la naturaleza. Apto para todas las edades.',
  },
};

/** Opciones de talle para el formulario de visitantes */
export const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/**
 * Enriquece los datos del backend con los metadatos visuales del frontend.
 * @param {Array} actividadesApi - Respuesta de GET /api/actividades
 * @returns {Array} Actividades con emoji, color y descripcion agregados
 */
export function enriquecerActividades(actividadesApi) {
  return actividadesApi.map(act => ({
    ...act,
    ...(UI_METADATA[act.nombre] ?? { emoji: '🎯', color: '#6366f1', descripcion: '' }),
  }));
}
