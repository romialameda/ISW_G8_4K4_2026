/**
 * Actividad.js — Entidad de Dominio (ESM)
 */
import { Horario } from './Horario.js';

export class Actividad {
  /**
   * @param {object} datos - Puede venir de la DB (plain object) o construirse directo
   */
  constructor({ id, nombre, requiereTalle, terminosYCondiciones, horarios = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.requiereTalle = requiereTalle;
    this.terminosYCondiciones = terminosYCondiciones;
    // Convertimos los datos planos de la DB a instancias de Horario (Patrón Mapper)
    this.horarios = horarios.map(h => h instanceof Horario ? h : new Horario(h));
  }

  obtenerHorario(hora) {
    return this.horarios.find(h => h.hora === hora) ?? null;
  }

  estaDisponible(hora) {
    const horario = this.obtenerHorario(hora);
    if (!horario) return false;
    return horario.estaActivo() && horario.tieneCupos();
  }
}
