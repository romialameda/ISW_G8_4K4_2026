/**
 * seedData.js
 * Datos iniciales (seed) de la base de datos en memoria.
 * Simula lo que en una DB real sería un script de migración/seed.
 *
 * Reglas de negocio encapsuladas aquí:
 *  - Tirolesa y Palestra requieren talle (equipamiento de seguridad con arnés)
 *  - Safari y Jardinería no requieren talle
 *  - Cada actividad tiene sus propios horarios con cupos iniciales
 */

export const SEED_ACTIVIDADES = [
  {
    id: 'act-001',
    nombre: 'Tirolesa',
    requiereTalle: true,
    terminosYCondiciones:
      'El participante debe usar el arnés provisto por el parque. ' +
      'Se requiere conocer el talle para ajustar el equipo de seguridad. ' +
      'Peso mínimo: 30 kg. Peso máximo: 120 kg. No apto para personas con vértigo.',
    horarios: [
      { hora: '10:00', cuposDisponibles: 10, activo: true },
      { hora: '12:00', cuposDisponibles: 10, activo: true },
      { hora: '14:00', cuposDisponibles: 5, activo: true },
      { hora: '16:00', cuposDisponibles: 1, activo: true },
    ],
  },
  {
    id: 'act-002',
    nombre: 'Safari',
    requiereTalle: false,
    terminosYCondiciones:
      'Los visitantes deben mantenerse dentro del vehículo en todo momento. ' +
      'No se permite el uso de flash para fotografiar a los animales. ' +
      'Menores de 5 años deben ir acompañados por un adulto.',
    horarios: [
      { hora: '09:00', cuposDisponibles: 20, activo: true },
      { hora: '11:00', cuposDisponibles: 20, activo: true },
      { hora: '13:00', cuposDisponibles: 8, activo: true },
      { hora: '15:00', cuposDisponibles: 1, activo: true },
    ],
  },
  {
    id: 'act-003',
    nombre: 'Palestra',
    requiereTalle: true,
    terminosYCondiciones:
      'Es obligatorio el uso de arnés y casco provistos por el parque. ' +
      'Se requiere talle para ajustar el arnés correctamente. ' +
      'No apto para personas con problemas cardíacos o musculares. ' +
      'Altura máxima de escalada: 8 metros.',
    horarios: [
      { hora: '10:00', cuposDisponibles: 8, activo: true },
      { hora: '14:00', cuposDisponibles: 8, activo: true },
      { hora: '16:00', cuposDisponibles: 3, activo: true },
    ],
  },
  {
    id: 'act-004',
    nombre: 'Jardinería',
    requiereTalle: false,
    terminosYCondiciones:
      'Los participantes utilizarán herramientas de jardinería bajo supervisión. ' +
      'Se recomienda usar ropa cómoda que pueda ensuciarse. ' +
      'Actividad apta para todas las edades.',
    horarios: [
      { hora: '10:00', cuposDisponibles: 15, activo: true },
      { hora: '11:00', cuposDisponibles: 15, activo: true },
      { hora: '15:00', cuposDisponibles: 7, activo: true },
      { hora: '17:00', cuposDisponibles: 0, activo: true },
    ],
  },
];
