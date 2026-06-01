/**
 * Visitante.js — Entidad de Dominio (ESM)
 */
import {
  ErrorDatosVisitanteIncompletos,
  ErrorTalleRequerido,
  ErrorEdadInvalida,
} from '../errors/DomainErrors.js';

export class Visitante {
  constructor({ nombre, dni, edad, talle }) {
    this.nombre = nombre;
    this.dni = dni;
    this.edad = edad;
    this.talle = talle;
  }

  /**
   * Valida que el visitante cumpla los requisitos de la actividad.
   * @param {{ requiereTalle: boolean, nombre: string }} actividad
   * @throws {ErrorTalleRequerido}
   * @throws {ErrorEdadInvalida}
   */
  validarParaActividad(actividad) {
    if (!this.nombre?.trim() || !this.dni?.trim() || this.edad === '' || this.edad === null || this.edad === undefined) {
      throw new ErrorDatosVisitanteIncompletos();
    }

    const edadNum = Number(this.edad);
    if (isNaN(edadNum) || edadNum < 0 || edadNum > 99) {
      throw new ErrorEdadInvalida();
    }

    if (actividad.requiereTalle && !this.talle) {
      throw new ErrorTalleRequerido(actividad.nombre);
    }
  }
}

