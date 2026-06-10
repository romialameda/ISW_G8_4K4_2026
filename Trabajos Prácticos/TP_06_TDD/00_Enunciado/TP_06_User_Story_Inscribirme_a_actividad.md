# TP 06 - User Story asignada

## Historia de Usuario

**Inscribirme a actividad**  
**Como** visitante  
**Quiero** inscribirme a una actividad  
**Para** reservar mi lugar en la misma.

**Prioridad / Puntaje:** 5

## Criterios de aceptación

- Debe requerir seleccionar una actividad del conjunto `Tirolesa`, `Safari`, `Palestra` y `Jardinería`, siempre que tenga cupos disponibles para el horario seleccionado.
- Debe requerir seleccionar el horario dentro de los disponibles.
- Debe indicar la cantidad de personas que participarán de la actividad.
- Para cada persona que participa, debe ingresar nombre, DNI, edad y talla de vestimenta si la actividad lo demanda.
- Debe requerir aceptar los términos y condiciones específicos de la actividad.
- Al finalizar la inscripción se debe enviar un correo electrónico con información de la inscripción realizada.

## Pruebas de usuario

### Casos que deben pasar

- Probar inscribirse a una actividad del listado que posee cupos disponibles, seleccionando un horario, ingresando los datos del visitante, aceptando los términos y condiciones y recibiendo el email de confirmación.
- Probar inscribirse a una actividad sin ingresar talle de vestimenta porque la actividad no lo requiere.

### Casos que deben fallar

- Probar inscribirse a una actividad que no tiene cupo para el horario seleccionado.
- Probar inscribirse a una actividad seleccionando un horario en el cual el parque está cerrado o la actividad no está disponible.
- Probar inscribirse a una actividad sin aceptar los términos y condiciones de la actividad.
- Probar inscribirse a una actividad sin ingresar el talle de la vestimenta requerido por la actividad.

## Alcance funcional derivado

- Validación de actividad existente y habilitada.
- Validación de horario disponible para la actividad.
- Validación de cupos para la cantidad de participantes solicitada.
- Registro de datos de cada visitante participante.
- Validación condicional de talla de vestimenta.
- Validación de aceptación de términos y condiciones.
- Generación de una inscripción confirmada.
- Envío de correo de confirmación al finalizar la inscripción.
