/**
 * InscripcionService.test.js — Tests del servicio (ESM)
 *
 * Estrategia TDD aplicada:
 *  - Inyección de Dependencias → los repositorios se mockean, no hay DB real.
 *  - Dobles de Prueba:
 *      · EmailSender → jest.fn() (Mock: verificamos interacción).
 *      · ActividadRepository → objeto con findByNombre: jest.fn() (Stub).
 *      · InscripcionRepository → objeto con save: jest.fn() (Stub).
 *  - Todos los mocks/stubs de repositorio retornan Promises (mockResolvedValue)
 *    porque los repositorios ahora son async (simulan DB real).
 *  - Patrón AAA: Arrange / Act / Assert.
 *  - Triangulación: Happy Path primero → errores por clases de equivalencia.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { InscripcionService } from '../../services/InscripcionService.js';
import { Actividad } from '../../models/Actividad.js';
import { Horario } from '../../models/Horario.js';
import {
  ErrorSinCupos,
  ErrorHorarioNoDisponible,
  ErrorTerminosNoAceptados,
  ErrorTalleRequerido,
} from '../../errors/DomainErrors.js';

// ─── Factory de mocks ──────────────────────────────────────────────────────────
/**
 * Crea un stub del ActividadRepository con una actividad de prueba controlada.
 * Retorna Promises porque los repositorios simulan acceso a DB (async).
 */
function crearRepoActividad({
  nombre = 'Tirolesa',
  requiereTalle = true,
  cuposDisponibles = 10,
  horarioActivo = true,
  hora = '10:00',
} = {}) {
  const actividadFake = new Actividad({
    id: 'act-test',
    nombre,
    requiereTalle,
    terminosYCondiciones: `T&C de ${nombre}`,
    horarios: [new Horario({ hora, cuposDisponibles, activo: horarioActivo })],
  });

  return {
    // Stub: devuelve la actividad fake como si viniera de la DB (async)
    findByNombre: jest.fn().mockResolvedValue(actividadFake),
    save: jest.fn().mockResolvedValue(actividadFake),
  };
}

/**
 * Crea un stub del InscripcionRepository (operaciones async, simula DB).
 */
function crearRepoInscripcion() {
  return {
    save: jest.fn().mockImplementation(async (inscripcion) => inscripcion),
  };
}

/**
 * Crea un Mock del EmailSender.
 * Usamos Mock (no Stub) porque necesitamos verificar la interacción (fue llamado con qué args).
 */
function crearEmailSender() {
  return {
    enviar: jest.fn().mockResolvedValue({ enviado: true }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('InscripcionService — inscribir()', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #1 — HAPPY PATH
  // Prueba de usuario: "...cupos disponibles, horario, datos del visitante
  //   (con talle), T&C aceptados → confirmada=true + email enviado (PASA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #1: Happy Path — Tirolesa con talle, cupos y T&C aceptados', () => {
    it('debe retornar confirmada=true, guardar en DB y enviar email', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      const emailSender    = crearEmailSender();
      const actividadRepo  = crearRepoActividad({ nombre: 'Tirolesa', requiereTalle: true });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Ana García', dni: '12345678', edad: 25, talle: 'M' }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      };

      // ── ACT ────────────────────────────────────────────────────────────────
      const resultado = await service.inscribir(solicitud);

      // ── ASSERT ─────────────────────────────────────────────────────────────
      // 1. La inscripción debe estar confirmada
      expect(resultado.confirmada).toBe(true);

      // 2. El ID debe tener el formato correcto
      expect(resultado.idInscripcion).toMatch(/^INS-/);

      // 3. Se consultó la DB para buscar la actividad
      expect(actividadRepo.findByNombre).toHaveBeenCalledWith('Tirolesa');

      // 4. Se persistió en la DB
      expect(inscripcionRepo.save).toHaveBeenCalledTimes(1);
      expect(actividadRepo.save).toHaveBeenCalledTimes(1);

      // 5. Se envió el email de confirmación (verificación de interacción)
      expect(emailSender.enviar).toHaveBeenCalledTimes(1);
      expect(emailSender.enviar).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatario: 'ana@email.com',
          actividad: 'Tirolesa',
          horario: '10:00',
        })
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #2 — SIN CUPOS
  // Prueba de usuario: "Probar inscribirse a una actividad que no tiene cupo
  //   para el horario seleccionado (FALLA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #2: Sin cupos disponibles → ErrorSinCupos', () => {
    it('debe lanzar ErrorSinCupos y NO guardar ni enviar email cuando los cuposDisponibles = 0', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      // DB devuelve actividad con cuposDisponibles = 0 en el horario
      const emailSender    = crearEmailSender();
      const actividadRepo  = crearRepoActividad({ cuposDisponibles: 0 });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa', horario: '10:00',
        visitantes: [{ nombre: 'Carlos', dni: '99999999', edad: 30, talle: 'L' }],
        terminosAceptados: true, emailContacto: 'carlos@email.com',
      };

      // ── ACT & ASSERT ───────────────────────────────────────────────────────
      await expect(service.inscribir(solicitud)).rejects.toThrow(ErrorSinCupos);

      // Los side-effects NO deben ejecutarse al fallar
      expect(inscripcionRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviar).not.toHaveBeenCalled();
    });

    it('debe lanzar ErrorSinCupos y NO guardar ni enviar email si la cantidad de visitantes supera los cupos disponibles', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      // DB devuelve actividad con cuposDisponibles = 2 en el horario, pero solicitamos para 3 visitantes
      const emailSender    = crearEmailSender();
      const actividadRepo  = crearRepoActividad({ cuposDisponibles: 2 });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa', horario: '10:00',
        visitantes: [
          { nombre: 'Carlos', dni: '99999999', edad: 30, talle: 'L' },
          { nombre: 'Marta', dni: '88888888', edad: 28, talle: 'M' },
          { nombre: 'Juan', dni: '77777777', edad: 25, talle: 'S' }
        ],
        terminosAceptados: true, emailContacto: 'carlos@email.com',
      };

      // ── ACT & ASSERT ───────────────────────────────────────────────────────
      await expect(service.inscribir(solicitud)).rejects.toThrow(ErrorSinCupos);

      // Los side-effects NO deben ejecutarse al fallar
      expect(inscripcionRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviar).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #3 — SIN TALLE EN ACTIVIDAD QUE NO LO REQUIERE
  // Prueba de usuario: "Probar inscribirse a Safari sin talle porque no lo
  //   requiere (PASA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #3: Safari sin talle (no requerido) → pasa', () => {
    it('debe confirmar la inscripción sin talle cuando la actividad no lo exige', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      const emailSender    = crearEmailSender();
      // Safari: requiereTalle = false → talle no es obligatorio
      const actividadRepo  = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '11:00' });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Safari', horario: '11:00',
        visitantes: [{ nombre: 'María López', dni: '55555555', edad: 35 }], // sin talle
        terminosAceptados: true, emailContacto: 'maria@email.com',
      };

      // ── ACT ────────────────────────────────────────────────────────────────
      const resultado = await service.inscribir(solicitud);

      // ── ASSERT ─────────────────────────────────────────────────────────────
      expect(resultado.confirmada).toBe(true);
      expect(emailSender.enviar).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #4 — HORARIO INACTIVO (PARQUE CERRADO)
  // Prueba de usuario: "Probar inscribirse en un horario en el cual el parque
  //   está cerrado o la actividad no está disponible (FALLA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #4: Horario inactivo → ErrorHorarioNoDisponible', () => {
    it('debe lanzar ErrorHorarioNoDisponible cuando el horario está marcado como inactivo en la DB', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      const emailSender    = crearEmailSender();
      // DB devuelve horario con activo=false (parque cerrado)
      const actividadRepo  = crearRepoActividad({ horarioActivo: false, cuposDisponibles: 10 });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa', horario: '10:00',
        visitantes: [{ nombre: 'Pedro', dni: '44444444', edad: 28, talle: 'XL' }],
        terminosAceptados: true, emailContacto: 'pedro@email.com',
      };

      // ── ACT & ASSERT ───────────────────────────────────────────────────────
      await expect(service.inscribir(solicitud)).rejects.toThrow(ErrorHorarioNoDisponible);
      expect(inscripcionRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviar).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #5 — TÉRMINOS NO ACEPTADOS
  // Prueba de usuario: "Probar inscribirse sin aceptar los T&C (FALLA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #5: T&C no aceptados → ErrorTerminosNoAceptados', () => {
    it('debe lanzar ErrorTerminosNoAceptados cuando terminosAceptados=false', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      const emailSender    = crearEmailSender();
      const actividadRepo  = crearRepoActividad();
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa', horario: '10:00',
        visitantes: [{ nombre: 'Laura', dni: '33333333', edad: 22, talle: 'S' }],
        terminosAceptados: false, // ← clase de equivalencia inválida
        emailContacto: 'laura@email.com',
      };

      // ── ACT & ASSERT ───────────────────────────────────────────────────────
      await expect(service.inscribir(solicitud)).rejects.toThrow(ErrorTerminosNoAceptados);
      expect(inscripcionRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviar).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST #6 — TALLE REQUERIDO NO INGRESADO
  // Prueba de usuario: "Probar inscribirse sin ingresar el talle requerido
  //   por la actividad (FALLA)"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Test #6: Tirolesa sin talle → ErrorTalleRequerido', () => {
    it('debe lanzar ErrorTalleRequerido cuando Tirolesa exige talle y el visitante no lo ingresó', async () => {
      // ── ARRANGE ────────────────────────────────────────────────────────────
      const emailSender    = crearEmailSender();
      const actividadRepo  = crearRepoActividad({ nombre: 'Tirolesa', requiereTalle: true });
      const inscripcionRepo = crearRepoInscripcion();
      const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

      const solicitud = {
        actividad: 'Tirolesa', horario: '10:00',
        visitantes: [{ nombre: 'Roberto', dni: '77777777', edad: 40 }], // sin talle
        terminosAceptados: true, emailContacto: 'roberto@email.com',
      };

      // ── ACT & ASSERT ───────────────────────────────────────────────────────
      await expect(service.inscribir(solicitud)).rejects.toThrow(ErrorTalleRequerido);
      expect(inscripcionRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviar).not.toHaveBeenCalled();
    });
  });

});
