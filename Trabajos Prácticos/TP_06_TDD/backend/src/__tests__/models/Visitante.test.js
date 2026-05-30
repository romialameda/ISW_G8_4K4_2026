/**
 * Visitante.test.js — Tests del modelo Visitante (ESM)
 * Patrón: AAA (Arrange / Act / Assert)
 */
import { describe, it, expect } from '@jest/globals';
import { Visitante } from '../../models/Visitante.js';
import { ErrorTalleRequerido } from '../../errors/DomainErrors.js';

describe('Visitante — Modelo de dominio', () => {

  describe('constructor', () => {
    it('debe crear un visitante con todos sus datos', () => {
      // ARRANGE & ACT
      const visitante = new Visitante({ nombre: 'Ana García', dni: '12345678', edad: 25, talle: 'M' });

      // ASSERT
      expect(visitante.nombre).toBe('Ana García');
      expect(visitante.dni).toBe('12345678');
      expect(visitante.edad).toBe(25);
      expect(visitante.talle).toBe('M');
    });

    it('debe crear un visitante sin talle (actividades que no lo requieren)', () => {
      // ARRANGE & ACT
      const visitante = new Visitante({ nombre: 'Carlos López', dni: '87654321', edad: 30 });

      // ASSERT
      expect(visitante.talle).toBeUndefined();
    });
  });

  describe('validarParaActividad(actividad)', () => {
    it('debe pasar cuando la actividad requiere talle y el visitante lo tiene', () => {
      // ARRANGE
      const visitante = new Visitante({ nombre: 'Ana', dni: '11111111', edad: 25, talle: 'M' });
      const actividadConTalle = { requiereTalle: true, nombre: 'Tirolesa' };

      // ACT & ASSERT — no lanza error
      expect(() => visitante.validarParaActividad(actividadConTalle)).not.toThrow();
    });

    it('debe lanzar ErrorTalleRequerido cuando la actividad requiere talle y el visitante NO lo tiene', () => {
      // ARRANGE
      const visitante = new Visitante({ nombre: 'Ana', dni: '11111111', edad: 25 });
      const actividadConTalle = { requiereTalle: true, nombre: 'Tirolesa' };

      // ACT & ASSERT
      expect(() => visitante.validarParaActividad(actividadConTalle)).toThrow(ErrorTalleRequerido);
    });

    it('debe pasar cuando la actividad NO requiere talle aunque el visitante no lo tenga', () => {
      // ARRANGE
      const visitante = new Visitante({ nombre: 'Carlos', dni: '22222222', edad: 30 });
      const actividadSinTalle = { requiereTalle: false, nombre: 'Safari' };

      // ACT & ASSERT
      expect(() => visitante.validarParaActividad(actividadSinTalle)).not.toThrow();
    });

    it('debe pasar con talle vacío cuando la actividad NO requiere talle', () => {
      // ARRANGE
      const visitante = new Visitante({ nombre: 'María', dni: '33333333', edad: 22, talle: '' });
      const actividadSinTalle = { requiereTalle: false, nombre: 'Jardinería' };

      // ACT & ASSERT
      expect(() => visitante.validarParaActividad(actividadSinTalle)).not.toThrow();
    });
  });
});
