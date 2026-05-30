/**
 * Actividad.test.js — Tests del modelo Actividad (ESM)
 * Patrón: AAA (Arrange / Act / Assert)
 */
import { describe, it, expect } from '@jest/globals';
import { Actividad } from '../../models/Actividad.js';
import { Horario } from '../../models/Horario.js';

describe('Actividad — Modelo de dominio', () => {

  describe('constructor', () => {
    it('debe crear una actividad con sus propiedades básicas', () => {
      // ARRANGE & ACT
      const actividad = new Actividad({
        id: 'act-001',
        nombre: 'Tirolesa',
        requiereTalle: true,
        terminosYCondiciones: 'Términos de Tirolesa...',
        horarios: [],
      });

      // ASSERT
      expect(actividad.nombre).toBe('Tirolesa');
      expect(actividad.requiereTalle).toBe(true);
      expect(actividad.terminosYCondiciones).toBe('Términos de Tirolesa...');
    });

    it('debe crear una actividad que NO requiere talle (Safari)', () => {
      // ARRANGE & ACT
      const actividad = new Actividad({
        id: 'act-002',
        nombre: 'Safari',
        requiereTalle: false,
        terminosYCondiciones: 'Términos de Safari...',
      });

      // ASSERT
      expect(actividad.requiereTalle).toBe(false);
    });

    it('debe mapear los horarios como instancias de Horario desde datos planos de DB', () => {
      // ARRANGE — datos planos como vendrían de la DB (no instancias)
      const datosPlanos = { hora: '10:00', cuposDisponibles: 5, activo: true };

      // ACT
      const actividad = new Actividad({
        id: 'act-003',
        nombre: 'Palestra',
        requiereTalle: true,
        terminosYCondiciones: '...',
        horarios: [datosPlanos],
      });

      // ASSERT — el constructor debe convertirlos a instancias de Horario
      expect(actividad.horarios[0]).toBeInstanceOf(Horario);
    });
  });

  describe('estaDisponible(hora)', () => {
    it('debe retornar true cuando el horario está activo y tiene cupos', () => {
      // ARRANGE
      const horario = new Horario({ hora: '10:00', cuposDisponibles: 5, activo: true });
      const actividad = new Actividad({
        id: 'act-001', nombre: 'Tirolesa', requiereTalle: true,
        terminosYCondiciones: '...', horarios: [horario],
      });

      // ACT
      const resultado = actividad.estaDisponible('10:00');

      // ASSERT
      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando cuposDisponibles = 0', () => {
      // ARRANGE
      const horario = new Horario({ hora: '10:00', cuposDisponibles: 0, activo: true });
      const actividad = new Actividad({
        id: 'act-001', nombre: 'Tirolesa', requiereTalle: true,
        terminosYCondiciones: '...', horarios: [horario],
      });

      // ACT & ASSERT
      expect(actividad.estaDisponible('10:00')).toBe(false);
    });

    it('debe retornar false cuando el horario está inactivo (parque cerrado)', () => {
      // ARRANGE
      const horario = new Horario({ hora: '22:00', cuposDisponibles: 10, activo: false });
      const actividad = new Actividad({
        id: 'act-002', nombre: 'Safari', requiereTalle: false,
        terminosYCondiciones: '...', horarios: [horario],
      });

      // ACT & ASSERT
      expect(actividad.estaDisponible('22:00')).toBe(false);
    });

    it('debe retornar false cuando el horario no existe', () => {
      // ARRANGE
      const actividad = new Actividad({
        id: 'act-003', nombre: 'Palestra', requiereTalle: true,
        terminosYCondiciones: '...', horarios: [],
      });

      // ACT & ASSERT
      expect(actividad.estaDisponible('15:00')).toBe(false);
    });
  });

  describe('obtenerHorario(hora)', () => {
    it('debe retornar el horario correcto dado una hora válida', () => {
      // ARRANGE
      const horario = new Horario({ hora: '14:00', cuposDisponibles: 3, activo: true });
      const actividad = new Actividad({
        id: 'act-004', nombre: 'Jardinería', requiereTalle: false,
        terminosYCondiciones: '...', horarios: [horario],
      });

      // ACT
      const resultado = actividad.obtenerHorario('14:00');

      // ASSERT
      expect(resultado).toBeInstanceOf(Horario);
      expect(resultado.hora).toBe('14:00');
    });

    it('debe retornar null si el horario no existe', () => {
      // ARRANGE
      const actividad = new Actividad({
        id: 'act-004', nombre: 'Jardinería', requiereTalle: false,
        terminosYCondiciones: '...', horarios: [],
      });

      // ACT & ASSERT
      expect(actividad.obtenerHorario('99:00')).toBeNull();
    });
  });
});
