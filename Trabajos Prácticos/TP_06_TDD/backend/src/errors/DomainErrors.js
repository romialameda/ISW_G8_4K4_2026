/**
 * DomainErrors.js — Errores de dominio (ESM)
 * Un error por cada Criterio de Aceptación violado.
 */

/** CA: "cupos disponibles para el horario seleccionado" */
export class ErrorSinCupos extends Error {
  constructor(actividad, horario) {
    super(`La actividad "${actividad}" no tiene cupos disponibles para el horario ${horario}.`);
    this.name = 'ErrorSinCupos';
  }
}

/** CA: "seleccionar el horario dentro de los disponibles" */
export class ErrorHorarioNoDisponible extends Error {
  constructor(horario) {
    super(`El horario ${horario} no está disponible (parque cerrado o actividad no habilitada).`);
    this.name = 'ErrorHorarioNoDisponible';
  }
}

/** CA: "Debe requerir aceptar los términos y condiciones" */
export class ErrorTerminosNoAceptados extends Error {
  constructor() {
    super('Debe aceptar los términos y condiciones de la actividad para inscribirse.');
    this.name = 'ErrorTerminosNoAceptados';
  }
}

/** CA: "talla de vestimenta si la actividad lo demanda" */
export class ErrorTalleRequerido extends Error {
  constructor(actividad) {
    super(`La actividad "${actividad}" requiere ingresar el talle de vestimenta para cada visitante.`);
    this.name = 'ErrorTalleRequerido';
  }
}

/** CA: "Debe indicar la cantidad de personas que participaran de la actividad" */
export class ErrorSinParticipantes extends Error {
  constructor() {
    super('Debe indicar al menos una persona para realizar la inscripción.');
    this.name = 'ErrorSinParticipantes';
  }
}

/** CA: "Para cada persona ... debe ingresar nombre, DNI y edad" */
export class ErrorDatosVisitanteIncompletos extends Error {
  constructor() {
    super('Cada visitante debe tener nombre, DNI y edad para completar la inscripción.');
    this.name = 'ErrorDatosVisitanteIncompletos';
  }
}

/** CA: "seleccionar una actividad del conjunto de actividades" */
export class ErrorActividadNoValida extends Error {
  constructor(actividad) {
    super(
      `"${actividad}" no es una actividad válida. ` +
      'Las actividades disponibles son: Tirolesa, Safari, Palestra, Jardinería.'
    );
    this.name = 'ErrorActividadNoValida';
  }
}

/** CA: "La edad de cada visitante debe estar entre 0 y 99 años" */
export class ErrorEdadInvalida extends Error {
  constructor() {
    super('La edad de cada visitante debe estar entre 0 y 99 años.');
    this.name = 'ErrorEdadInvalida';
  }
}

