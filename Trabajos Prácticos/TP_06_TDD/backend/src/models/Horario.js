/**
 * Horario.js — Entidad de Valor (ESM)
 */
export class Horario {
  constructor({ hora, cuposDisponibles, activo = true }) {
    this.hora = hora;
    this.cuposDisponibles = cuposDisponibles;
    this.activo = activo;
  }

  tieneCupos(cantidad = 1) { return this.cuposDisponibles >= cantidad; }

  estaActivo() { return this.activo; }

  reservarCupo(cantidad = 1) {
    if (!this.tieneCupos(cantidad)) throw new Error('No hay cupos disponibles para reservar.');
    this.cuposDisponibles -= cantidad;
  }
}
