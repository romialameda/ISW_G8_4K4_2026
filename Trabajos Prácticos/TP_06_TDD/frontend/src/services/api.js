/**
 * api.js — Cliente HTTP del frontend
 *
 * Centraliza todas las llamadas al backend Express.
 * Lanza errores con el mismo `name` que los errores de dominio del backend
 * para que InscripcionPage.jsx los maneje con los mensajes correctos.
 *
 * Base URL configurada por variable de entorno Vite (VITE_API_URL).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Actividades ───────────────────────────────────────────────────────────────

/**
 * Obtiene el catálogo de actividades desde el backend.
 * @returns {Promise<Array>} Lista de actividades con horarios y disponibilidad
 */
export async function getActividades() {
  const res = await fetch(`${API_URL}/api/actividades`);

  if (!res.ok) {
    throw new Error('No se pudo cargar el listado de actividades. Intentá más tarde.');
  }

  const json = await res.json();
  return json.data;
}

// ── Inscripciones ─────────────────────────────────────────────────────────────

/**
 * Envía una solicitud de inscripción al backend.
 * Si el servidor responde con un error de dominio (4xx), lanza un Error
 * con el mismo `name` que el backend usa (ej: 'ErrorSinCupos').
 *
 * @param {object} solicitud
 * @param {string} solicitud.actividad
 * @param {string} solicitud.horario
 * @param {Array}  solicitud.visitantes
 * @param {boolean} solicitud.terminosAceptados
 * @param {string} solicitud.emailContacto
 *
 * @returns {Promise<{ confirmada: boolean, idInscripcion: string }>}
 * @throws {Error} con .name del error de dominio del backend
 */
export async function postInscripcion(solicitud) {
  const res = await fetch(`${API_URL}/api/inscripciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitud),
  });

  const json = await res.json();

  if (!res.ok) {
    // Recreamos el error con el mismo name que el backend envía
    // para que el switch de mensajes amigables en InscripcionPage funcione
    const err = new Error(json.mensaje || 'Error al procesar la inscripción');
    err.name = json.error || 'ErrorDesconocido';
    throw err;
  }

  return json.data;
}
