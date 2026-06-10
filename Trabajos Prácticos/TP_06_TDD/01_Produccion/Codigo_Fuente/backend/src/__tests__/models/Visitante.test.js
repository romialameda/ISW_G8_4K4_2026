import { describe, it, expect } from '@jest/globals';
import { Visitante } from '../../models/Visitante.js';
import {
  ErrorDatosVisitanteIncompletos,
  ErrorTalleRequerido,
  ErrorEdadInvalida,
  ErrorDniInvalido,
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

    it('pasa cuando la edad es el límite inferior: 0', () => {
      const visitante = new Visitante({ nombre: 'Bebe', dni: '11111111', edad: 0 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('pasa cuando la edad es el límite superior: 99', () => {
      const visitante = new Visitante({ nombre: 'Anciano', dni: '11111111', edad: 99 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('lanza ErrorEdadInvalida cuando la edad es menor al límite inferior: -1', () => {
      const visitante = new Visitante({ nombre: 'Negativo', dni: '11111111', edad: -1 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorEdadInvalida);
    });

    it('lanza ErrorEdadInvalida cuando la edad es mayor al límite superior: 100', () => {
      const visitante = new Visitante({ nombre: 'Centenario', dni: '11111111', edad: 100 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorEdadInvalida);
    });

    it('pasa cuando el DNI tiene exactamente 7 dígitos', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '1234567', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('pasa cuando el DNI tiene exactamente 8 dígitos', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '12345678', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).not.toThrow();
    });

    it('lanza ErrorDniInvalido cuando el DNI tiene menos de 7 dígitos (ej: 6)', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '123456', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDniInvalido);
    });

    it('lanza ErrorDniInvalido cuando el DNI tiene más de 8 dígitos (ej: 9)', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '123456789', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDniInvalido);
    });

    it('lanza ErrorDniInvalido cuando el DNI contiene letras', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '1234567a', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDniInvalido);
    });

    it('lanza ErrorDniInvalido cuando el DNI contiene puntos o caracteres especiales', () => {
      const visitante = new Visitante({ nombre: 'Juan', dni: '12.345.678', edad: 25 });
      const actividad = { requiereTalle: false, nombre: 'Safari' };

      expect(() => visitante.validarParaActividad(actividad)).toThrow(ErrorDniInvalido);
    });
  });
});
