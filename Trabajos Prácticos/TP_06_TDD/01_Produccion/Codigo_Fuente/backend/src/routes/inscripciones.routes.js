/**
 * inscripciones.routes.js
 * POST /api/inscripciones → crear inscripción
 */
import { Router } from 'express';
import { InscripcionController } from '../controllers/InscripcionController.js';

const router = Router();
const controller = new InscripcionController();

router.post('/', (req, res) => controller.inscribir(req, res));

export default router;
