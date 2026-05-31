/**
 * Visitante.js — Entidad de Dominio (ESM)
 */
import {
  ErrorDatosVisitanteIncompletos,
  ErrorTalleRequerido,
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
   */
  validarParaActividad(actividad) {
    if (!this.nombre?.trim() || !this.dni?.trim() || this.edad === '' || this.edad === null || this.edad === undefined) {
      throw new ErrorDatosVisitanteIncompletos();
    }

    if (actividad.requiereTalle && !this.talle) {
      throw new ErrorTalleRequerido(actividad.nombre);
    }
  }
}
