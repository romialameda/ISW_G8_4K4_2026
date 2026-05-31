/**
 * InscripcionService.js — Servicio de Dominio (ESM)
 *
 * Orquesta la inscripción de visitantes.
 * Los repositorios ahora son ASYNC (simulan acceso a DB real).
 * Recibe sus dependencias por inyección de constructor (DIP - SOLID).
 */

import { Inscripcion } from '../models/Inscripcion.js';
import { Visitante } from '../models/Visitante.js';
import {
  ErrorSinCupos,
  ErrorHorarioNoDisponible,
  ErrorTerminosNoAceptados,
  ErrorActividadNoValida,
} from '../errors/DomainErrors.js';

export class InscripcionService {
  /**
   * @param {object} emailSender          - Implementa enviar({ destinatario, actividad, ... })
   * @param {import('../repositories/ActividadRepository.js').ActividadRepository} actividadRepository
   * @param {import('../repositories/InscripcionRepository.js').InscripcionRepository} inscripcionRepository
   */
  constructor(emailSender, actividadRepository, inscripcionRepository) {
    this.emailSender = emailSender;
    this.actividadRepository = actividadRepository;
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * Inscribe visitantes a una actividad.
   * @param {object} solicitud
   * @returns {Promise<{ confirmada: boolean, idInscripcion: string }>}
   */
  async inscribir(solicitud) {
    const {
      actividad: nombreActividad,
      horario: horaSeleccionada,
      visitantes: datosVisitantes,
      terminosAceptados,
      emailContacto,
    } = solicitud;

    // ─── 1. Buscar actividad en la DB (async) ────────────────────────────
    const actividad = await this.actividadRepository.findByNombre(nombreActividad);
    if (!actividad) {
      throw new ErrorActividadNoValida(nombreActividad);
    }

    // ─── 2. Validar horario activo ────────────────────────────────────────
    const horario = actividad.obtenerHorario(horaSeleccionada);
    if (!horario || !horario.estaActivo()) {
      throw new ErrorHorarioNoDisponible(horaSeleccionada);
    }

    // ─── 3. Validar cupos ─────────────────────────────────────────────────
    if (!horario.tieneCupos(datosVisitantes.length)) {
      throw new ErrorSinCupos(nombreActividad, horaSeleccionada);
    }

    // ─── 4. Validar T&C ───────────────────────────────────────────────────
    if (!terminosAceptados) {
      throw new ErrorTerminosNoAceptados();
    }

    // ─── 5. Crear y validar visitantes ────────────────────────────────────
    const visitantes = datosVisitantes.map(datos => {
      const v = new Visitante(datos);
      v.validarParaActividad(actividad); // puede lanzar ErrorTalleRequerido
      return v;
    });

    // ─── 6. Crear inscripción y persistir en la DB (async) ────────────────
    const inscripcion = new Inscripcion({
      actividad,
      horario,
      visitantes,
      terminosAceptados,
      emailContacto,
    });
    inscripcion.confirmar();
    await this.actividadRepository.save(actividad);
    await this.inscripcionRepository.save(inscripcion);

    // ─── 7. Enviar email de confirmación (side-effect) ────────────────────
    await this.emailSender.enviar({
      destinatario: emailContacto,
      actividad: nombreActividad,
      horario: horaSeleccionada,
      idInscripcion: inscripcion.id,
      visitantes,
    });

    return {
      confirmada: inscripcion.confirmada,
      idInscripcion: inscripcion.id,
    };
  }
}
