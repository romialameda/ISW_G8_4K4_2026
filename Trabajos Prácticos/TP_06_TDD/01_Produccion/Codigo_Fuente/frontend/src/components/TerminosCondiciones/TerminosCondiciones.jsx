// TerminosCondiciones.jsx — Paso 4: aceptación de T&C
export default function TerminosCondiciones({ actividad, aceptado, onCambiar }) {
  if (!actividad) return null;

  return (
    <div className="card">
      <h2 className="card-title">📋 Términos y condiciones</h2>
      <p className="card-subtitle">
        Leé los términos específicos de {actividad.nombre} antes de continuar
      </p>

      <div className="terminos-box" id="terminos-texto">
        {actividad.terminosYCondiciones}
      </div>

      <label
        className={`terminos-check ${aceptado ? 'checked' : ''}`}
        id="label-terminos"
        htmlFor="checkbox-terminos"
      >
        <input
          type="checkbox"
          id="checkbox-terminos"
          checked={aceptado}
          onChange={e => onCambiar(e.target.checked)}
        />
        <span className="check-visual">{aceptado ? '✓' : ''}</span>
        <span className="terminos-check-text">
          Acepto los términos y condiciones de la actividad <strong>{actividad.nombre}</strong>
        </span>
      </label>
    </div>
  );
}
