// HorarioSelector.jsx — Paso 2: selección de horario
export default function HorarioSelector({ actividad, horarioSeleccionado, onSeleccionar }) {
  if (!actividad) return null;

  const getCuposClass = (cupos) => {
    if (cupos === 0) return 'sin-cupo';
    if (cupos <= 3) return 'pocos';
    return 'ok';
  };

  const getCuposLabel = (cupos, activo) => {
    if (!activo) return 'No disponible';
    if (cupos === 0) return 'Sin cupos';
    if (cupos === 1) return '1 cupo';
    return `${cupos} cupos`;
  };

  return (
    <div className="card">
      <h2 className="card-title">
        {actividad.emoji} Horarios de {actividad.nombre}
      </h2>
      <p className="card-subtitle">Los horarios tachados no tienen cupos o están cerrados</p>
      <div className="horarios-grid">
        {actividad.horarios.map(h => {
          const isDisabled = !h.activo;
          return (
            <button
              key={h.hora}
              id={`horario-${h.hora.replace(':', '')}`}
              className={`horario-btn ${horarioSeleccionado === h.hora ? 'selected' : ''}`}
              onClick={() => !isDisabled && onSeleccionar(h.hora)}
              disabled={isDisabled}
            >
              <span className="horario-hora">{h.hora}</span>
              <span className={`horario-cupos ${getCuposClass(h.cuposDisponibles)}`}>
                {getCuposLabel(h.cuposDisponibles, h.activo)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
