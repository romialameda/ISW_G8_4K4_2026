import { describe, it, expect, jest } from '@jest/globals';
import { InscripcionService } from '../../services/InscripcionService.js';
import { Actividad } from '../../models/Actividad.js';
import { Horario } from '../../models/Horario.js';
import {
  ErrorActividadNoValida,
  ErrorDatosVisitanteIncompletos,
  ErrorHorarioNoDisponible,
  ErrorSinCupos,
  ErrorSinParticipantes,
  ErrorTalleRequerido,
  ErrorTerminosNoAceptados,
  ErrorEdadInvalida,
} from '../../errors/DomainErrors.js';

function crearRepoActividad({
  nombre = 'Tirolesa',
  requiereTalle = true,
  cuposDisponibles = 10,
  horarioActivo = true,
  hora = '10:00',
} = {}) {
  const actividad = new Actividad({
    id: 'act-test',
    nombre,
    requiereTalle,
    terminosYCondiciones: `T&C de ${nombre}`,
    horarios: [new Horario({ hora, cuposDisponibles, activo: horarioActivo })],
  });

  return {
    findByNombre: jest.fn().mockResolvedValue(actividad),
    save: jest.fn().mockResolvedValue(actividad),
  };
}

function crearRepoInscripcion() {
  return {
    save: jest.fn().mockImplementation(async (inscripcion) => inscripcion),
  };
}

function crearEmailSender() {
  return {
    enviar: jest.fn().mockResolvedValue({ enviado: true }),
  };
}

function crearRepoActividadInvalida() {
  return {
    findByNombre: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
  };
}

describe('InscripcionService.inscribir', () => {
  // CP-01 — Registro exitoso con actividad que requiere vestimenta (pasa) 
  it('confirma la inscripcion, guarda y envia email en el happy path', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Tirolesa', requiereTalle: true });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Tirolesa',
      horario: '10:00',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25, talle: 'M' }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
    expect(resultado.idInscripcion).toMatch(/^INS-/);
    expect(actividadRepo.findByNombre).toHaveBeenCalledWith('Tirolesa');
    expect(actividadRepo.save).toHaveBeenCalledTimes(1);
    expect(inscripcionRepo.save).toHaveBeenCalledTimes(1);
    expect(emailSender.enviar).toHaveBeenCalledWith(
      expect.objectContaining({
        destinatario: 'ana@email.com',
        actividad: 'Tirolesa',
        horario: '10:00',
      }),
    );
  });

  // CP-02 — Sin cupos disponibles (falla) 
  it('lanza ErrorSinCupos cuando no hay cupos disponibles', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ cuposDisponibles: 0 });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Carlos', dni: '99999999', edad: 30, talle: 'L' }],
        terminosAceptados: true,
        emailContacto: 'carlos@email.com',
      }),
    ).rejects.toThrow(ErrorSinCupos);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-03 – Inscripción rechazada porque la cantidad supera los cupos disponibles
  it('lanza ErrorSinCupos cuando la cantidad de visitantes supera los cupos', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ cuposDisponibles: 2 });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [
          { nombre: 'Carlos', dni: '99999999', edad: 30, talle: 'L' },
          { nombre: 'Marta', dni: '88888888', edad: 28, talle: 'M' },
          { nombre: 'Juan', dni: '77777777', edad: 25, talle: 'S' },
        ],
        terminosAceptados: true,
        emailContacto: 'carlos@email.com',
      }),
    ).rejects.toThrow(ErrorSinCupos);
  });

  // CP-04 — Registro exitoso con actividad que no requiere talle
  it('permite inscribirse sin talle cuando la actividad no lo requiere', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '11:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '11:00',
      visitantes: [{ nombre: 'Maria Lopez', dni: '55555555', edad: 35 }],
      terminosAceptados: true,
      emailContacto: 'maria@email.com',
    });

    expect(resultado.confirmada).toBe(true);
    expect(emailSender.enviar).toHaveBeenCalledTimes(1);
  });

  it('lanza ErrorHorarioNoDisponible cuando el horario esta inactivo', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ horarioActivo: false, cuposDisponibles: 10 });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Pedro', dni: '44444444', edad: 28, talle: 'XL' }],
        terminosAceptados: true,
        emailContacto: 'pedro@email.com',
      }),
    ).rejects.toThrow(ErrorHorarioNoDisponible);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-05 — Inscripción rechazada por horario inactivo o no disponible
  it('lanza ErrorHorarioNoDisponible cuando el horario no existe en la actividad', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Tirolesa', hora: '12:00', cuposDisponibles: 10 });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Pedro', dni: '44444444', edad: 28, talle: 'XL' }],
        terminosAceptados: true,
        emailContacto: 'pedro@email.com',
      }),
    ).rejects.toThrow(ErrorHorarioNoDisponible);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-06 — Inscripción rechazada por no aceptar términos y condiciones
  it('lanza ErrorTerminosNoAceptados cuando no se aceptan los terminos', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad();
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Laura', dni: '33333333', edad: 22, talle: 'S' }],
        terminosAceptados: false,
        emailContacto: 'laura@email.com',
      }),
    ).rejects.toThrow(ErrorTerminosNoAceptados);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-07 — Inscripción rechazada por falta de talle requerido
  it('lanza ErrorTalleRequerido cuando falta el talle obligatorio', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Tirolesa', requiereTalle: true });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Tirolesa',
        horario: '10:00',
        visitantes: [{ nombre: 'Roberto', dni: '77777777', edad: 40 }],
        terminosAceptados: true,
        emailContacto: 'roberto@email.com',
      }),
    ).rejects.toThrow(ErrorTalleRequerido);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-08 — Inscripción rechazada por actividad inválida
  it('lanza ErrorActividadNoValida cuando la actividad no existe', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividadInvalida();
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Kayak',
        horario: '09:00',
        visitantes: [{ nombre: 'Ana', dni: '12345678', edad: 22 }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      }),
    ).rejects.toThrow(ErrorActividadNoValida);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-09 — Inscripción rechazada por no indicar participantes
  it('lanza ErrorSinParticipantes cuando no se informa ningun visitante', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '09:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '09:00',
        visitantes: [],
        terminosAceptados: true,
        emailContacto: 'contacto@email.com',
      }),
    ).rejects.toThrow(ErrorSinParticipantes);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-10 — Inscripción rechazada por datos incompletos del visitante
  it('lanza ErrorDatosVisitanteIncompletos cuando falta nombre, dni o edad', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '09:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '09:00',
        visitantes: [{ nombre: '', dni: '12345678', edad: '' }],
        terminosAceptados: true,
        emailContacto: 'contacto@email.com',
      }),
    ).rejects.toThrow(ErrorDatosVisitanteIncompletos);

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(emailSender.enviar).not.toHaveBeenCalled();
  });

  // CP-11 — Registro exitoso con múltiples participantes sin talle requerido
  it('permite inscribirse múltiples participantes sin talle cuando la actividad no lo requiere', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '11:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '11:00',
      visitantes: [{ nombre: 'Maria Lopez', dni: '55555555', edad: 35 }, { nombre: 'Ana Lopez', dni: '12345678', edad: 25 }],
      terminosAceptados: true,
      emailContacto: 'maria@email.com',
    });

    expect(resultado.confirmada).toBe(true);
    expect(emailSender.enviar).toHaveBeenCalledTimes(1);
  });

  // CP-12 — Registro exitoso con edad del visitante en el límite inferior: 0
  it('confirma la inscripción cuando el visitante tiene el límite inferior de edad: 0', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '10:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '10:00',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 0 }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
  });

  it('confirma la inscripción cuando el visitante tiene el límite superior de edad: 99', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '10:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '10:00',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 99 }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
  });

  // CP-12 — Registro rechazado por edad del visitante menor a 0
  it('lanza ErrorEdadInvalida cuando la edad del visitante es menor a 0', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '10:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '10:00',
        visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: -1 }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      }),
    ).rejects.toThrow(ErrorEdadInvalida);
  });

  // CP-12 — Registro rechazado por edad del visitante mayor a 99
  it('lanza ErrorEdadInvalida cuando la edad del visitante es mayor a 99', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '10:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '10:00',
        visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 100 }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      }),
    ).rejects.toThrow(ErrorEdadInvalida);
  });

  // Pruebas TDD - Límites de horario del parque (08:30 a 19:00)
  it('confirma la inscripción cuando el horario es el límite inferior: 08:30', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '08:30' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '08:30',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25 }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
  });

  it('confirma la inscripción cuando el horario es el límite superior: 19:00', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '19:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '19:00',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25 }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
  });

  // CP-13 — Registro rechazado por horario del parque menor al límite inferior: 08:29
  it('lanza ErrorHorarioNoDisponible cuando el horario es menor al límite inferior: 08:29', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '08:29' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '08:29',
        visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25 }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      }),
    ).rejects.toThrow(ErrorHorarioNoDisponible);
  });

  it('lanza ErrorHorarioNoDisponible cuando el horario es mayor al límite superior: 19:01', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '19:01' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    await expect(
      service.inscribir({
        actividad: 'Safari',
        horario: '19:01',
        visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25 }],
        terminosAceptados: true,
        emailContacto: 'ana@email.com',
      }),
    ).rejects.toThrow(ErrorHorarioNoDisponible);
  });

  it('confirma la inscripción en un horario intermedio válido: 12:00', async () => {
    const emailSender = crearEmailSender();
    const actividadRepo = crearRepoActividad({ nombre: 'Safari', requiereTalle: false, hora: '12:00' });
    const inscripcionRepo = crearRepoInscripcion();
    const service = new InscripcionService(emailSender, actividadRepo, inscripcionRepo);

    const resultado = await service.inscribir({
      actividad: 'Safari',
      horario: '12:00',
      visitantes: [{ nombre: 'Ana Garcia', dni: '12345678', edad: 25 }],
      terminosAceptados: true,
      emailContacto: 'ana@email.com',
    });

    expect(resultado.confirmada).toBe(true);
  });
});

