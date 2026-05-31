import { describe, it, expect, jest } from '@jest/globals';
import { InscripcionService } from '../../services/InscripcionService.js';
import { Actividad } from '../../models/Actividad.js';
import { Horario } from '../../models/Horario.js';
import {
  ErrorDatosVisitanteIncompletos,
  ErrorHorarioNoDisponible,
  ErrorSinCupos,
  ErrorSinParticipantes,
  ErrorTalleRequerido,
  ErrorTerminosNoAceptados,
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

describe('InscripcionService.inscribir', () => {
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
});
