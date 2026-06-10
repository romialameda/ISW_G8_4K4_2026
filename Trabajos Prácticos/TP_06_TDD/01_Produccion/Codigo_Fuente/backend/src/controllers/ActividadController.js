/**
 * ActividadController.js — Controlador MVC (ESM)
 */
import { ActividadRepository } from '../repositories/ActividadRepository.js';

const actividadRepository = new ActividadRepository();

export class ActividadController {
  async obtenerActividades(req, res) {
    const actividades = await actividadRepository.findAll();
    const respuesta = actividades.map(a => ({
      nombre: a.nombre,
      requiereTalle: a.requiereTalle,
      terminosYCondiciones: a.terminosYCondiciones,
      horarios: a.horarios.map(h => ({
        hora: h.hora,
        cuposDisponibles: h.cuposDisponibles,
        activo: h.activo,
        disponible: h.estaActivo() && h.tieneCupos(),
      })),
    }));
    return res.status(200).json({ ok: true, data: respuesta });
  }
}
