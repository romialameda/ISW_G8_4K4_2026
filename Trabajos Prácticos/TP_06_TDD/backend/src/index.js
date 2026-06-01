/**
 * index.js — Servidor Express principal
 *
 * Arquitectura:
 *  - Express como servidor HTTP
 *  - CORS habilitado para cualquier origen localhost (desarrollo)
 *  - Rutas REST bajo el prefijo /api
 *  - Manejo de errores centralizado
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import actividadesRoutes from './routes/actividades.routes.js';
import inscripcionesRoutes from './routes/inscripciones.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────────────────────────────
// CORS: permite cualquier origen localhost (frontend en 5173 o 5174)
app.use(cors({
  origin: /^http:\/\/localhost(:\d+)?$/,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Parsear body JSON en las requests
app.use(express.json());

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/actividades', actividadesRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mensaje: 'Backend corriendo correctamente', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📋 Actividades: http://localhost:${PORT}/api/actividades`);
  console.log(`✉️  Inscripciones: POST http://localhost:${PORT}/api/inscripciones`);
});

export default app;
