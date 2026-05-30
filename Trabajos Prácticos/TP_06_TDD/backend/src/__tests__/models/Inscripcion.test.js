/**
 * Inscripcion.test.js — Tests del modelo Inscripcion (ESM)
 * Patrón: AAA (Arrange / Act / Assert)
 */
import { describe, it, expect } from '@jest/globals';
import { Inscripcion } from '../../models/Inscripcion.js';

describe('Inscripcion — Modelo de dominio', () => {

  const actividadFake = { nombre: 'Tirolesa', requiereTalle: true };
  const horarioFake   = { hora: '10:00', cuposDisponibles: 5, activo: true };
  const visitantesFake = [{ nombre: 'Ana', dni: '12345678', edad: 25, talle: 'M' }];

  const datosBase = () => ({
    actividad: actividadFake,
    horario: horarioFake,
    visitantes: visitantesFake,
    terminosAceptados: true,
    emailContacto: 'ana@email.com',
  });

  describe('constructor', () => {
    it('debe crear una inscripción con estado confirmada=false por defecto', () => {
      // ARRANGE & ACT
      const inscripcion = new Inscripcion(datosBase());

      // ASSERT
      expect(inscripcion.confirmada).toBe(false);
      expect(inscripcion.actividad).toBe(actividadFake);
      expect(inscripcion.visitantes).toEqual(visitantesFake);
      expect(inscripcion.emailContacto).toBe('ana@email.com');
    });

    it('debe generar un ID único con prefijo INS- para cada inscripción', () => {
      // ARRANGE & ACT
      const ins1 = new Inscripcion(datosBase());
      const ins2 = new Inscripcion(datosBase());

      // ASSERT
      expect(ins1.id).toMatch(/^INS-/);
      expect(ins2.id).toMatch(/^INS-/);
      expect(ins1.id).not.toBe(ins2.id);
    });

    it('debe registrar la fecha de inscripción dentro del rango de ejecución', () => {
      // ARRANGE
      const antes = new Date();

      // ACT
      const inscripcion = new Inscripcion(datosBase());
      const despues = new Date();

      // ASSERT
      expect(inscripcion.fechaInscripcion.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(inscripcion.fechaInscripcion.getTime()).toBeLessThanOrEqual(despues.getTime());
    });
  });

  describe('confirmar()', () => {
    it('debe cambiar el estado confirmada a true', () => {
      // ARRANGE
      const inscripcion = new Inscripcion(datosBase());
      expect(inscripcion.confirmada).toBe(false); // pre-condición

      // ACT
      inscripcion.confirmar();

      // ASSERT
      expect(inscripcion.confirmada).toBe(true);
    });
  });
});
