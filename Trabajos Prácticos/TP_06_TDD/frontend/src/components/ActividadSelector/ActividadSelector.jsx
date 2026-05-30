// ActividadSelector.jsx — Paso 1: selección de actividad
// Las actividades vienen del backend via props (no hardcodeadas localmente)
export default function ActividadSelector({ actividades, seleccionada, onSeleccionar }) {
  return (
    <div className="card">
      <h2 className="card-title">🎯 Elegí una actividad</h2>
      <p className="card-subtitle">Solo se muestran actividades con horarios disponibles</p>
      <div className="actividades-grid">
        {actividades.map(act => {
          const tieneAlgunCupo = act.horarios.some(h => h.disponible);
          return (
            <button
              key={act.nombre}
              id={`actividad-${act.nombre.toLowerCase().replace('í','i')}`}
              className={`actividad-card ${seleccionada?.nombre === act.nombre ? 'selected' : ''}`}
              style={{ '--act-color': act.color, opacity: tieneAlgunCupo ? 1 : 0.55 }}
              onClick={() => tieneAlgunCupo && onSeleccionar(act)}
              disabled={!tieneAlgunCupo}
              title={!tieneAlgunCupo ? 'Sin cupos disponibles' : act.descripcion}
            >
              <span className="actividad-emoji">{act.emoji}</span>
              <div className="actividad-nombre">{act.nombre}</div>
              <div className="actividad-desc">{act.descripcion}</div>
              <span className={`actividad-badge ${act.requiereTalle ? 'requiere' : ''}`}>
                {act.requiereTalle ? '👕 Requiere talle' : '✓ Sin talle'}
              </span>
              {!tieneAlgunCupo && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>
                  Sin cupos disponibles
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
