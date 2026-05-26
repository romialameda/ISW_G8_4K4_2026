# Retroalimentación TP 04 - SCM - Herramientas de SCM

## Nota

**5 (Cinco)**

## Observaciones de la cátedra

- Dentro de `tps`, aclarar si existe una estructura interna para cada directorio y si todos los trabajos prácticos comparten la misma estructura.
- Revisar las entradas y salidas de los trabajos prácticos según lo indicado en la guía. Considerar también si aplican trabajos de investigación.
- Definir si `Planificación` se considera un ítem de configuración o un directorio.
- Revisar la estructura propuesta para asegurar que sea escalable y permita recuperar información en el futuro.
- Especificar las extensiones permitidas para cada tipo de archivo. No dejar la regla abierta a "cualquiera".
- Aclarar qué representan `n` y `m` en la convención de nombrado y si alguno de esos valores representa la versión del ítem.
- Definir si `Descripcion_CI` es un ítem de configuración.
- Precisar en qué momento se considera adecuado marcar una línea base.

## Interpretación del equipo

- Se necesitaba formalizar una estructura interna común para todos los directorios de trabajos prácticos.
- Hacía falta distinguir con más claridad entre ítems de configuración de tipo archivo e ítems de tipo directorio.
- Era necesario acotar las extensiones válidas por tipo de artefacto y aclarar mejor la convención de nombres.
- El criterio de línea base debía quedar asociado a un momento concreto del trabajo, por ejemplo una entrega o una corrección cerrada.

## Acciones tomadas

- Se redefinió la estructura de `Trabajos Prácticos` con subdirectorios comunes por cada TP.
- Se actualizaron `README.md` y `Descripcion_CI.md` para incluir:
  - estructura interna de TPs
  - extensiones permitidas
  - definición de `Planificación`
  - incorporación de `Descripcion_CI.md` como ítem de configuración
  - criterio explícito para marcar líneas base
