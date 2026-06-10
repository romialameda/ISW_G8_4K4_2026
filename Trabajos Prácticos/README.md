# Estructura común de trabajos prácticos

Cada trabajo práctico del repositorio debe almacenarse en un directorio con formato `TP_<NN>_<Tema>/`.

## Estructura obligatoria

- `00_Enunciado/`: consigna oficial, aclaraciones y material base.
- `01_Produccion/`: borradores, documentos intermedios y archivos de trabajo.
- `02_Entrega/`: versión final presentada.
- `03_Retroalimentacion/`: devoluciones, correcciones o capturas asociadas a la revisión.
- `04_Evidencias_Repositorio/`: evidencia de commits, updates, tags o líneas base cuando aplique.
- Si el TP requiere implementación o prototipos ejecutables, el código fuente se almacena dentro de `01_Produccion/Codigo_Fuente/`.

## Reglas de uso

- Todos los TPs comparten la misma estructura para facilitar búsqueda, auditoría y recuperación.
- Si una carpeta no aplica a un TP determinado, se conserva vacía para no romper la estructura común.
- Los archivos generados por el grupo deben nombrarse como `TP_<NN>_<Artefacto>_v<MAJOR>.<MINOR>.<ext>`.
- Las devoluciones deben nombrarse como `TP_<NN>_Retroalimentacion_<AAAA-MM-DD>.<ext>`.
- Las evidencias de repositorio deben nombrarse como `TP_<NN>_Evidencia_<Descripcion>_<AAAA-MM-DD>.<ext>`.

## Ejemplo

```text
Trabajos Prácticos/
└── TP_05_SCM_Uso_Repositorio/
    ├── 00_Enunciado/
    ├── 01_Produccion/
    ├── 02_Entrega/
    ├── 03_Retroalimentacion/
    └── 04_Evidencias_Repositorio/
```
