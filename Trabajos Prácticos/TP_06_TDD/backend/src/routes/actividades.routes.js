/**
 * actividades.routes.js
 * GET /api/actividades → lista de actividades con horarios
 */
import { Router } from 'express';
import { ActividadController } from '../controllers/ActividadController.js';

const router = Router();
const controller = new ActividadController();

router.get('/', (req, res) => controller.obtenerActividades(req, res));

export default router;
