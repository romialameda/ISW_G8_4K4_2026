# TP 06 - TDD

## Portada

**Materia:** Ingenieria y Calidad de Software  
**Trabajo Practico:** TP 06 - TDD  
**Unidad:** Unidad Nro. 4 - Aseguramiento de Calidad de Proceso y de Producto  
**Proyecto:** EcoHarmony Park  
**User Story asignada:** Inscribirme a actividad  

## 1. Introduccion

El presente informe documenta la resolucion del Trabajo Practico 06, cuyo objetivo fue implementar una funcionalidad aplicando el enfoque **Test Driven Development (TDD)**.

La historia de usuario asignada al grupo fue la siguiente:

**Como** visitante  
**Quiero** inscribirme a una actividad  
**Para** reservar mi lugar en la misma.

## 2. Consigna resumida

La consigna del trabajo solicita implementar una funcionalidad aplicando el ciclo:

- Red
- Green
- Refactor

Ademas, se requiere:

- una implementacion funcional de la User Story
- pruebas automatizadas que cubran los casos definidos
- un documento que justifique las decisiones de diseno tomadas

## 3. User Story asignada

### Historia de Usuario

**Inscribirme a actividad**  
**Como** visitante  
**Quiero** inscribirme a una actividad  
**Para** reservar mi lugar en la misma.

**Prioridad / Puntaje:** 5

### Criterios de aceptacion

- Debe requerir seleccionar una actividad del conjunto `Tirolesa`, `Safari`, `Palestra` y `Jardineria`, siempre que tenga cupos disponibles para el horario seleccionado.
- Debe requerir seleccionar el horario dentro de los disponibles.
- Debe indicar la cantidad de personas que participaran de la actividad.
- Para cada persona que participa, debe ingresar nombre, DNI, edad y talla de vestimenta si la actividad lo demanda.
- Debe requerir aceptar los terminos y condiciones especificos de la actividad.
- Al finalizar la inscripcion se debe enviar un correo electronico con informacion de la inscripcion realizada.

## 4. Enfoque general de la solucion

La solucion fue desarrollada separando responsabilidades entre frontend y backend:

- **Frontend:** interfaz para seleccionar actividad, horario, cargar visitantes, aceptar terminos y mostrar el resultado.
- **Backend:** validacion de reglas de negocio, confirmacion de la inscripcion, descuento de cupos, persistencia y simulacion del envio de email.

Esta separacion permitio ubicar las validaciones criticas del negocio en backend, sin depender exclusivamente de la interfaz.

## 5. Estrategia TDD aplicada

Se siguio el enfoque **Red - Green - Refactor** de la siguiente manera:

### Red

Se escribieron primero pruebas automatizadas para representar los escenarios relevantes de la User Story:

- inscripcion exitosa
- falta de cupos
- horario no disponible
- terminos no aceptados
- talle faltante
- actividad invalida
- ausencia de participantes
- datos incompletos del visitante

### Green

Luego se implemento el codigo minimo necesario para hacer pasar las pruebas:

- validacion de actividad
- validacion de horario
- control de cupos
- validacion de participantes
- validacion de talle cuando corresponde
- confirmacion de la inscripcion
- simulacion del envio del email

### Refactor

Una vez estabilizados los tests, se mejoro la organizacion del codigo mediante:

- separacion en modelos, servicios, controladores y repositorios
- definicion de errores de dominio especificos
- encapsulamiento de reglas del negocio dentro del dominio
- desacople del servicio de email

## 6. Decisiones de diseno

### 6.1 Validaciones en backend

Se decidio centralizar en backend las reglas principales del dominio:

- actividad valida
- horario existente y activo
- cupos suficientes
- al menos un participante
- datos obligatorios por visitante
- talle obligatorio cuando la actividad lo requiere
- aceptacion de terminos y condiciones

Esto asegura consistencia incluso si la solicitud no proviene del frontend.

### 6.2 Validaciones en frontend

En frontend se aplicaron validaciones tempranas para mejorar la experiencia de uso:

- seleccion obligatoria de actividad
- seleccion obligatoria de horario
- control de campos obligatorios
- control basico del email de contacto

Estas validaciones funcionan como apoyo de usabilidad, pero no reemplazan las del backend.

### 6.3 Errores de dominio especificos

Se definieron errores explicitos para cada falla funcional relevante:

- `ErrorActividadNoValida`
- `ErrorHorarioNoDisponible`
- `ErrorSinCupos`
- `ErrorSinParticipantes`
- `ErrorDatosVisitanteIncompletos`
- `ErrorTerminosNoAceptados`
- `ErrorTalleRequerido`

Esto mejora claridad, mantenibilidad y capacidad de prueba.

### 6.4 Simulacion del email

El envio del correo se implemento de forma desacoplada y actualmente se simula desde backend. Esto permite:

- verificar la invocacion desde pruebas
- conservar el flujo funcional completo
- reemplazar facilmente la implementacion por una real en el futuro

## 7. Casos de prueba funcionales

### CP-01 - Registro exitoso con actividad que requiere talle

**Precondiciones**

- Existe la actividad `Tirolesa`.
- El horario `10:00` se encuentra disponible.
- El horario tiene al menos `1` cupo libre.
- La actividad requiere talle de vestimenta.

**Pasos**

1. Seleccionar la actividad `Tirolesa`.
2. Seleccionar el horario `10:00`.
3. Indicar `1` participante.
4. Ingresar los datos del visitante: `Nombre = Ana Garcia`, `DNI = 12345678`, `Edad = 25`, `Talle = M`.
5. Ingresar un email de contacto valido.
6. Aceptar terminos y condiciones.
7. Confirmar la inscripcion.

**Resultados esperados**

- El sistema confirma la inscripcion.
- Se genera un identificador de inscripcion.
- Se registra la inscripcion.
- Los cupos disminuyen en `1`.
- Se dispara el envio del email de confirmacion.

### CP-02 - Inscripcion rechazada por falta de cupos

**Precondiciones**

- Existe la actividad `Tirolesa`.
- El horario `10:00` existe.
- El horario no posee cupos disponibles.

**Pasos**

1. Seleccionar la actividad `Tirolesa`.
2. Seleccionar el horario `10:00`.
3. Indicar `1` participante.
4. Ingresar datos validos del visitante con talle.
5. Aceptar terminos y condiciones.
6. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que no hay cupos disponibles.
- No se registra ninguna inscripcion.
- No se modifican los cupos.
- No se envia email.

### CP-03 - Inscripcion rechazada porque la cantidad supera los cupos

**Precondiciones**

- Existe la actividad `Tirolesa`.
- El horario `10:00` se encuentra activo.
- El horario dispone de `2` cupos.

**Pasos**

1. Seleccionar la actividad `Tirolesa`.
2. Seleccionar el horario `10:00`.
3. Indicar `3` participantes.
4. Completar los datos de los tres visitantes con nombre, DNI, edad y talle.
5. Aceptar terminos y condiciones.
6. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que los cupos son insuficientes para la cantidad solicitada.
- No se registra ninguna inscripcion.
- No se modifican los cupos.

### CP-04 - Registro exitoso con actividad que no requiere talle

**Precondiciones**

- Existe la actividad `Safari`.
- El horario `11:00` se encuentra disponible.
- Hay cupos libres.
- La actividad no requiere talle de vestimenta.

**Pasos**

1. Seleccionar la actividad `Safari`.
2. Seleccionar el horario `11:00`.
3. Indicar `1` participante.
4. Ingresar los datos del visitante: `Nombre = Maria Lopez`, `DNI = 55555555`, `Edad = 35`.
5. No ingresar talle.
6. Ingresar email de contacto valido.
7. Aceptar terminos y condiciones.
8. Confirmar la inscripcion.

**Resultados esperados**

- El sistema confirma la inscripcion.
- No exige talle de vestimenta.
- Registra la inscripcion correctamente.
- Descuenta el cupo correspondiente.

### CP-05 - Inscripcion rechazada por horario inactivo o no disponible

**Precondiciones**

- Existe la actividad `Tirolesa`.
- El horario seleccionado se encuentra inactivo o no habilitado.

**Pasos**

1. Seleccionar la actividad `Tirolesa`.
2. Seleccionar un horario inactivo.
3. Ingresar un visitante con datos validos.
4. Aceptar terminos y condiciones.
5. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que el horario no esta disponible.
- No se registra ninguna inscripcion.
- No se alteran cupos.

### CP-06 - Inscripcion rechazada por no aceptar terminos y condiciones

**Precondiciones**

- Existe una actividad valida con horario disponible y cupos libres.

**Pasos**

1. Seleccionar una actividad.
2. Seleccionar un horario disponible.
3. Ingresar participantes con datos completos.
4. No aceptar terminos y condiciones.
5. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que debe aceptar terminos y condiciones.
- No se registra la inscripcion.
- No se envia email.

### CP-07 - Inscripcion rechazada por falta de talle requerido

**Precondiciones**

- Existe la actividad `Tirolesa`.
- La actividad requiere talle.
- El horario seleccionado tiene cupos disponibles.

**Pasos**

1. Seleccionar la actividad `Tirolesa`.
2. Seleccionar un horario disponible.
3. Indicar `1` participante.
4. Ingresar `Nombre`, `DNI` y `Edad`, dejando vacio el `Talle`.
5. Aceptar terminos y condiciones.
6. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que la actividad requiere talle de vestimenta.
- No se registra la inscripcion.

### CP-08 - Inscripcion rechazada por actividad invalida

**Precondiciones**

- El sistema solo admite las actividades `Tirolesa`, `Safari`, `Palestra` y `Jardineria`.

**Pasos**

1. Intentar enviar una inscripcion para una actividad inexistente.
2. Completar el resto de los datos de forma valida.
3. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la solicitud.
- Se informa que la actividad no es valida.
- No se registra ninguna inscripcion.

### CP-09 - Inscripcion rechazada por no indicar participantes

**Precondiciones**

- Existe una actividad valida con horario activo y cupos libres.

**Pasos**

1. Seleccionar una actividad valida.
2. Seleccionar un horario disponible.
3. No ingresar participantes.
4. Aceptar terminos y condiciones.
5. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que debe indicarse al menos una persona.
- No se registra ninguna inscripcion.

### CP-10 - Inscripcion rechazada por datos incompletos del visitante

**Precondiciones**

- Existe una actividad valida con horario disponible y cupos libres.

**Pasos**

1. Seleccionar una actividad valida.
2. Seleccionar un horario disponible.
3. Ingresar `1` participante.
4. Dejar incompleto alguno de los siguientes datos: `nombre`, `DNI` o `edad`.
5. Aceptar terminos y condiciones.
6. Confirmar la inscripcion.

**Resultados esperados**

- El sistema rechaza la inscripcion.
- Se informa que los datos del visitante estan incompletos.
- No se registra ninguna inscripcion.

### CP-11 - Registro exitoso con multiples participantes

**Precondiciones**

- Existe una actividad valida con horario activo.
- El horario tiene al menos `2` cupos disponibles.

**Pasos**

1. Seleccionar una actividad valida.
2. Seleccionar un horario disponible.
3. Indicar `2` participantes.
4. Completar correctamente los datos de ambos visitantes.
5. Ingresar email de contacto valido.
6. Aceptar terminos y condiciones.
7. Confirmar la inscripcion.

**Resultados esperados**

- El sistema confirma la inscripcion.
- Se registra una unica inscripcion con dos visitantes asociados.
- Los cupos disminuyen en `2`.
- Se envia el email de confirmacion.

## 8. Evidencia tecnica

### Backend

Se verifico la ejecucion correcta de la suite automatizada del backend.

- Resultado actual: `33 tests` aprobados.
- Se cubren modelos, servicio de inscripcion y reglas principales del dominio.

### Frontend

Se verifico el frontend luego de corregir la compatibilidad de dependencias y alinear mensajes con el backend.

- `npm install` resuelto con Vite 7 compatible con el plugin de React.
- `npm run build` ejecutado correctamente.

## 9. Revision final de entrega

### Estado actual

La solucion se considera apta para entrega dentro del alcance del trabajo practico.

### Puntos fuertes

- validaciones principales de negocio centralizadas en backend
- uso de errores de dominio especificos
- cobertura automatizada del backend
- flujo funcional completo para la User Story
- documentacion consolidada en un unico informe

### Limitaciones reconocidas

- el envio de email es simulado
- no hay pruebas automaticas del frontend
- las validaciones de formato fino pueden seguir mejorandose
- la cantidad de personas se modela a partir de la lista de visitantes y no como un campo separado

## 10. Conclusion

La implementacion desarrollada permite resolver la User Story **"Inscribirme a actividad"** mediante una solucion funcional, modular y testeable.

El trabajo busco respetar el enfoque TDD, comenzando por escenarios y comportamientos esperados, para luego construir el codigo minimo necesario y finalmente reorganizar la solucion en una estructura mas clara y mantenible.

La entrega queda respaldada por:

- implementacion funcional
- pruebas automatizadas
- casos de prueba documentados
- decisiones de diseno justificadas
- evidencia tecnica verificada
