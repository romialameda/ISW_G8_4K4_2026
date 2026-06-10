/**
 * Inscripcion.js — Raíz de Agregado (ESM)
 */
export class Inscripcion {
  constructor({ actividad, horario, visitantes, terminosAceptados, emailContacto }) {
    this.id = `INS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    this.actividad = actividad;
    this.horario = horario;
    this.visitantes = visitantes;
    this.terminosAceptados = terminosAceptados;
    this.emailContacto = emailContacto;
    this.fechaInscripcion = new Date();
    this.confirmada = false;
  }

  confirmar() {
    this.confirmada = true;
    this.horario.reservarCupo(this.visitantes.length);
  }
}
