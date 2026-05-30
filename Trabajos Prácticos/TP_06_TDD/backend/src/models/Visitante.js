/**
 * Visitante.js — Entidad de Dominio (ESM)
 */
import { ErrorTalleRequerido } from '../errors/DomainErrors.js';

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
    if (actividad.requiereTalle && !this.talle) {
      throw new ErrorTalleRequerido(actividad.nombre);
    }
  }
}
