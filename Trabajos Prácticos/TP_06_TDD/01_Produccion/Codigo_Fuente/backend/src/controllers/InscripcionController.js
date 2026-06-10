/**
 * InscripcionController.js — Controlador MVC (ESM)
 */
import { InscripcionService } from '../services/InscripcionService.js';
import { ActividadRepository } from '../repositories/ActividadRepository.js';
import { InscripcionRepository } from '../repositories/InscripcionRepository.js';
import { EmailService } from '../services/EmailService.js';

const inscripcionService = new InscripcionService(
  new EmailService(),
  new ActividadRepository(),
  new InscripcionRepository()
);

const DOMAIN_ERROR_HTTP = {
  ErrorActividadNoValida:    400,
  ErrorHorarioNoDisponible:  400,
  ErrorSinCupos:             409,
  ErrorSinParticipantes:     422,
  ErrorDatosVisitanteIncompletos: 422,
  ErrorTerminosNoAceptados:  422,
  ErrorTalleRequerido:       422,
  ErrorEdadInvalida:         422,
};

export class InscripcionController {
  async inscribir(req, res) {
    try {
      const resultado = await inscripcionService.inscribir(req.body);
      return res.status(201).json({ ok: true, data: resultado });
    } catch (error) {
      const status = DOMAIN_ERROR_HTTP[error.name] ?? 500;
      return res.status(status).json({ ok: false, error: error.name, mensaje: error.message });
    }
  }
}
