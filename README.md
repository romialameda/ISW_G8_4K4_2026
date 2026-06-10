# ISW_G8_4K4_2026

Repositorio de la materia Ingeniería y Calidad de Software, año 2026, primer cuatrimestre, curso 4K4.

## Integrantes del grupo

| Nombre | Legajo | Mail |
| --- | --- | --- |
| Bergero, Christian Javier | 63526 | [christian.javier.bergero@gmail.com](mailto:christian.javier.bergero@gmail.com) |
| Comas, Lautaro Aryan | 96586 | [lautaroacomas@gmail.com](mailto:lautaroacomas@gmail.com) |
| Figueroa Prada, Juan Uriel | 407213 | [juan48820@gmail.com](mailto:juan48820@gmail.com) |
| Gomez Alameda, Romina Abigail | 85296 | [romiialameda@gmail.com](mailto:romiialameda@gmail.com) |
| Gonzalez, Melisa Alejandra | 61029 | [melygonzalez352@gmail.com](mailto:melygonzalez352@gmail.com) |
| Martellotto, Tomás Ezequiel | 91550 | [martellottoezequiel@gmail.com](mailto:martellottoezequiel@gmail.com) |
| Peveraro, Fabrizio | 97805 | [fabripeveraro01@gmail.com](mailto:fabripeveraro01@gmail.com) |
| López Mora, Francisco | 96274 | [franciscolopezmora3@gmail.com](mailto:franciscolopezmora3@gmail.com) |
| Iturriza, Mariano | 415324 | [marianoiturriza01@gmail.com](mailto:marianoiturriza01@gmail.com) |

## Estructura del repositorio

```text
ISW_G8_4K4_2026
├── Material de clase/
│   ├── Bibliografía/
│   ├── Guías/
│   ├── Planificación/
│   ├── Presentaciones Teóricas/
│   ├── Resumenes/
│   └── Templates/
├── Trabajos Prácticos/
│   ├── README.md
│   ├── TP_04_SCM_Herramientas/
│   │   ├── 00_Enunciado/
│   │   ├── 01_Produccion/
│   │   ├── 02_Entrega/
│   │   └── 03_Retroalimentacion/
│   ├── TP_05_SCM_Uso_Repositorio/
│       ├── 00_Enunciado/
│       ├── 01_Produccion/
│       ├── 02_Entrega/
│       ├── 03_Retroalimentacion/
│       └── 04_Evidencias_Repositorio/
│   └── TP_06_TDD/
│       ├── 00_Enunciado/
│       ├── 01_Produccion/
│       │   └── Codigo_Fuente/
│       ├── 02_Entrega/
│       ├── 03_Retroalimentacion/
│       └── 04_Evidencias_Repositorio/
├── Descripcion_CI.md
└── .gitignore
```

## Criterios de organización

- Un ítem de configuración puede ser un archivo o un directorio. La granularidad de control se define en `Descripcion_CI.md`.
- `Planificación` es un ítem de configuración de tipo directorio: agrupa cronogramas, programa de la asignatura y material de seguimiento.
- `Descripcion_CI.md` sí es un ítem de configuración, porque documenta qué se controla en el repositorio y cómo se versiona.
- `Trabajos Prácticos` funciona como contenedor. Cada TP evaluable se registra como un directorio independiente y todos comparten la misma estructura interna base.
- Cuando la cátedra provee un archivo con nombre oficial, se conserva ese nombre. Cuando el material es producido por el grupo, se aplican las reglas de nombrado indicadas abajo.

## Configuración del repositorio

| Ítem de configuración | Unidad de control | Regla de nombrado | Extensiones permitidas | Ubicación física | Tipo de ítem |
| --- | --- | --- | --- | --- | --- |
| Bibliografía | Directorio | Conservar nombre oficial del material provisto por la cátedra | `.pdf` | `Material de clase/Bibliografía/` | Recurso de la cátedra |
| Guías | Directorio | Conservar nombre oficial del material provisto por la cátedra | `.pdf` | `Material de clase/Guías/` | Recurso de la cátedra |
| Filminas | Directorio | `PPT_<NN>_<Tema>.pdf` | `.pdf` | `Material de clase/Presentaciones Teóricas/Parcial <NN>/Filminas/` | Recurso de la cátedra |
| Notas de clases grupales | Directorio | `Nota_<NN>_<Tema>_<AAAA-MM-DD>.pdf` | `.pdf` | `Material de clase/Presentaciones Teóricas/Parcial <NN>/Notas de clases grupales/` | Material propio |
| Planificación | Directorio | `Planificacion_<Tema>.<ext>` | `.md`, `.pdf` | `Material de clase/Planificación/` | Recurso de la cátedra |
| Templates | Directorio | `Template_<Tema>.<ext>` | `.docx`, `.xlsx`, `.md` | `Material de clase/Templates/` | Recurso de la cátedra |
| Resúmenes | Directorio | `Resumen_<Tema>.<ext>` | `.md`, `.pdf` | `Material de clase/Resumenes/` | Material propio |
| Trabajo práctico | Directorio | `TP_<NN>_<Tema>/` | No aplica | `Trabajos Prácticos/` | Material propio |
| Artefacto de trabajo práctico | Archivo | `TP_<NN>_<Artefacto>_v<MAJOR>.<MINOR>.<ext>` | `.md`, `.pdf`, `.docx`, `.xlsx`, `.pptx` | `Trabajos Prácticos/TP_<NN>_<Tema>/01_Produccion/` y `02_Entrega/` | Material propio |
| Retroalimentación de trabajo práctico | Archivo | `TP_<NN>_Retroalimentacion_<AAAA-MM-DD>.<ext>` | `.md`, `.pdf`, `.png`, `.jpg`, `.jpeg` | `Trabajos Prácticos/TP_<NN>_<Tema>/03_Retroalimentacion/` | Material propio |
| Evidencia de repositorio | Archivo | `TP_<NN>_Evidencia_<Descripcion>_<AAAA-MM-DD>.<ext>` | `.md`, `.pdf`, `.png`, `.jpg`, `.jpeg` | `Trabajos Prácticos/TP_<NN>_<Tema>/04_Evidencias_Repositorio/` | Material propio |
| Documento de estructura SCM | Archivo | `README.md` | `.md` | `/` | Documento de gestión |
| Tabla de ítems de configuración | Archivo | `Descripcion_CI.md` | `.md` | `/` | Documento de gestión |

## Glosario de tokens

| Token | Significado |
| --- | --- |
| `<NN>` | Número de dos dígitos del parcial, TP o secuencia, por ejemplo `04` o `05` |
| `<Tema>` | Tema o título corto del material, usando `_` como separador |
| `<Artefacto>` | Tipo de archivo generado por el grupo, por ejemplo `Resolucion`, `Informe`, `Checklist` o `Cronograma` |
| `<AAAA-MM-DD>` | Fecha con formato ISO 8601 |
| `<ext>` | Extensión permitida para el ítem de configuración |
| `v<MAJOR>.<MINOR>` | Versión del archivo. `MAJOR` cambia cuando hay una nueva entrega o reestructuración importante; `MINOR` cambia por ajustes dentro de la misma entrega |

## Estructura interna de trabajos prácticos

Todos los directorios `TP_<NN>_<Tema>/` deben seguir esta estructura:

- `00_Enunciado/`: consigna, guía, aclaraciones y material base del TP.
- `01_Produccion/`: material de trabajo del grupo previo a la entrega.
- `02_Entrega/`: versión final entregada.
- `03_Retroalimentacion/`: corrección o devolución recibida.
- `04_Evidencias_Repositorio/`: capturas, reportes o evidencia de commits, updates, tags y líneas base cuando el TP lo requiera.
- Si un TP incluye código fuente, este se ubica dentro de `01_Produccion/Codigo_Fuente/`.

Si un TP no necesita una de las carpetas, la estructura igual se conserva para mantener consistencia y escalabilidad.

## Criterio para crear una línea base

Se define como momento adecuado para marcar una línea base el cierre de una versión lista para entregar o una versión corregida y aprobada por el grupo.

Antes de crearla deben cumplirse estas condiciones:

1. Los archivos del TP están ubicados en la carpeta correcta y respetan las reglas de nombrado.
2. La versión a congelar está completa y lista para ser entregada, o bien incorpora una corrección cerrada.
3. La tabla de ítems de configuración en `Descripcion_CI.md` refleja la estructura vigente del repositorio.
4. El grupo revisó la versión y no quedan cambios pendientes conocidos para esa entrega.

## Convención de tags para líneas base

- Formato: `LB-TP<NN>-v<N>`
- Ejemplos:
  - `LB-TP04-v1`: primera línea base del TP4.
  - `LB-TP05-v1`: primera línea base del TP5.
  - `LB-TP05-v2`: línea base posterior a correcciones o nueva congelación aprobada.
