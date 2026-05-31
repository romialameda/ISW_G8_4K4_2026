import { describe, it, expect } from '@jest/globals';
import { Visitante } from '../../models/Visitante.js';
import {
  ErrorDatosVisitanteIncompletos,
  ErrorTalleRequerido,
} from '../../errors/DomainErrors.js';

describe('Visitante', () => {
  describe('constructor', () => {
    it('crea un visitante con todos sus datos', () => {
      const visitante = new Visitante({
        nombre: 'Ana Garcia',
        dni: '12345678',
        edad: 25,
        talle: 'M',
      });

      expect(visitante.nombre).toBe('Ana Garcia');
      expect(visitante.dni).toBe('12345678');
      expect(visitante.edad).toBe(25);
      expect(visitante.talle).toBe('M');
    });

    it('permite crear un visitante sin talle', () => {
      const visitante = new Visitante({
        nombre: 'Carlos Lopez',
        dni: '87654321',
        edad: 30,
      });

      expect(visitante.talle).toBeUndefined();
    });
  });

  describe('validarParaActividad', () => {
    it('pasa cuando la actividad requiere talle y el visitante lo tiene', () => {
      const visitante = new Visitante({ nombre: 'Ana', dni: '11111111', edad: 25, talle: 'M' });
      const actividad = { requiereTalle: true, nombre: 'Tirolesa' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('lanza ErrorTalleRequerido cuando falta el talle requerido', () => {
      const visitante = new Visitante({ nombre: 'Ana', dni: '11111111', edad: 25 });
      const actividad = { requiereTalle: true, nombre: 'Tirolesa' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorTalleRequerido);
    });

    it('pasa cuando la actividad no requiere talle', () => {
      const visitante = new Visitante({ nombre: 'Carlos', dni: '22222222', edad: 30 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('lanza ErrorDatosVisitanteIncompletos cuando falta el nombre', () => {
      const visitante = new Visitante({ nombre: '', dni: '11111111', edad: 25, talle: 'M' });
      const actividad = { requiereTalle: true, nombre: 'Tirolesa' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDatosVisitanteIncompletos);
    });

    it('lanza ErrorDatosVisitanteIncompletos cuando falta el dni', () => {
      const visitante = new Visitante({ nombre: 'Ana', dni: '', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDatosVisitanteIncompletos);
    });

    it('lanza ErrorDatosVisitanteIncompletos cuando falta la edad', () => {
      const visitante = new Visitante({ nombre: 'Ana', dni: '11111111', edad: '' });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDatosVisitanteIncompletos);
    });
  });
});
