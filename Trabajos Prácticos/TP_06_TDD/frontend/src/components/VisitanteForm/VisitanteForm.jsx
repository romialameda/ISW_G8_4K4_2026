// VisitanteForm.jsx — Paso 3: datos de visitantes
import { TALLES } from '../../data/actividadesData';

const VISITANTE_INICIAL = { nombre: '', dni: '', edad: '', talle: '' };

export default function VisitanteForm({ actividad, visitantes, onChange }) {
  const agregar = () => onChange([...visitantes, { ...VISITANTE_INICIAL }]);

  const eliminar = (idx) => {
    if (visitantes.length === 1) return; // al menos 1 visitante
    onChange(visitantes.filter((_, i) => i !== idx));
  };

  const actualizar = (idx, campo, valor) => {
    const copia = visitantes.map((v, i) => i === idx ? { ...v, [campo]: valor } : v);
    onChange(copia);
  };

  return (
    <div className="card">
      <div className="visitante-header">
        <div>
          <h2 className="card-title">👥 Datos de los visitantes</h2>
          <p className="card-subtitle">
            {actividad?.requiereTalle
              ? '⚠️ Esta actividad requiere ingresar el talle de vestimenta'
              : '✓ Esta actividad no requiere talle de vestimenta'}
          </p>
        </div>
      </div>

      {visitantes.map((visitante, idx) => (
        <div key={idx} className="visitante-block">
          {visitantes.length > 1 && (
            <button
              className="btn-remove-visitante"
              onClick={() => eliminar(idx)}
              title="Eliminar visitante"
              id={`btn-remove-visitante-${idx}`}
            >
              ×
            </button>
          )}
          <div className="visitante-block-title">
            <span>👤</span> Visitante {idx + 1}
          </div>

          <div className="form-grid cols-3">
            <div className="field">
              <label htmlFor={`nombre-${idx}`}>Nombre completo *</label>
              <input
                id={`nombre-${idx}`}
                type="text"
                placeholder="Ej: Ana García"
                value={visitante.nombre}
                onChange={e => actualizar(idx, 'nombre', e.target.value)}
                className={!visitante.nombre ? 'error' : ''}
              />
            </div>
            <div className="field">
              <label htmlFor={`dni-${idx}`}>DNI *</label>
              <input
                id={`dni-${idx}`}
                type="text"
                placeholder="Ej: 12345678"
                value={visitante.dni}
                onChange={e => actualizar(idx, 'dni', e.target.value.replace(/\D/g, ''))}
                maxLength={8}
              />
            </div>
            <div className="field">
              <label htmlFor={`edad-${idx}`}>Edad *</label>
              <input
                id={`edad-${idx}`}
                type="number"
                placeholder="Ej: 25"
                value={visitante.edad}
                min={0} max={99}
                onChange={e => actualizar(idx, 'edad', e.target.value)}
              />
            </div>
          </div>

          {actividad?.requiereTalle && (
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="field">
                <label htmlFor={`talle-${idx}`}>Talle de vestimenta *</label>
                <select
                  id={`talle-${idx}`}
                  value={visitante.talle}
                  onChange={e => actualizar(idx, 'talle', e.target.value)}
                  className={!visitante.talle ? 'error' : ''}
                >
                  <option value="">Seleccioná un talle</option>
                  {TALLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {!visitante.talle && (
                  <span className="field-error">Talle requerido para esta actividad</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        id="btn-agregar-visitante"
        className="btn-add-visitante"
        onClick={agregar}
      >
        <span>＋</span> Agregar otro visitante
      </button>
    </div>
  );
}
