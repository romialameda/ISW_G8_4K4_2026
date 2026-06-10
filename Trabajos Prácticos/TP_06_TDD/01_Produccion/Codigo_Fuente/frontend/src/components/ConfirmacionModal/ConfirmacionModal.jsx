// ConfirmacionModal.jsx — Modal de éxito post-inscripción
export default function ConfirmacionModal({ inscripcion, onCerrar }) {
  if (!inscripcion) return null;

  return (
    <div className="modal-overlay" id="modal-confirmacion" role="dialog" aria-modal="true">
      <div className="modal">
        <span className="modal-icon">🎉</span>
        <h2>¡Inscripción confirmada!</h2>
        <p>
          Te enviamos un email de confirmación a <strong>{inscripcion.emailContacto}</strong>.
          Guardá tu número de inscripción para el día de la actividad.
        </p>

        <div className="modal-details">
          <div className="modal-detail-row">
            <span className="modal-detail-label">N° de inscripción</span>
            <span className="modal-detail-value modal-id">{inscripcion.idInscripcion}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Actividad</span>
            <span className="modal-detail-value">
              {inscripcion.emoji} {inscripcion.actividad}
            </span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Horario</span>
            <span className="modal-detail-value">🕙 {inscripcion.horario}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Visitantes</span>
            <span className="modal-detail-value">{inscripcion.totalVisitantes} persona(s)</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Email</span>
            <span className="modal-detail-value">📧 {inscripcion.emailContacto}</span>
          </div>
        </div>

        <button
          id="btn-nueva-inscripcion"
          className="btn btn-success btn-lg"
          onClick={onCerrar}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Hacer otra inscripción
        </button>
      </div>
    </div>
  );
}
