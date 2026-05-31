import { useState, useEffect } from 'react';
import ActividadSelector from '../../components/ActividadSelector/ActividadSelector';
import HorarioSelector from '../../components/HorarioSelector/HorarioSelector';
import VisitanteForm from '../../components/VisitanteForm/VisitanteForm';
import TerminosCondiciones from '../../components/TerminosCondiciones/TerminosCondiciones';
import ConfirmacionModal from '../../components/ConfirmacionModal/ConfirmacionModal';
import { getActividades, postInscripcion } from '../../services/api';
import { enriquecerActividades } from '../../data/actividadesData';

const PASOS = [
  { num: 1, label: 'Actividad' },
  { num: 2, label: 'Horario' },
  { num: 3, label: 'Visitantes' },
  { num: 4, label: 'Términos' },
];

const VISITANTE_VACIO = { nombre: '', dni: '', edad: '', talle: '' };

const ERROR_MENSAJES = {
  ErrorSinCupos: '❌ No hay cupos disponibles para el horario seleccionado.',
  ErrorHorarioNoDisponible: '❌ El horario seleccionado no está disponible o el parque está cerrado.',
  ErrorSinParticipantes: '❌ Debés indicar al menos una persona para realizar la inscripción.',
  ErrorDatosVisitanteIncompletos: '❌ Cada visitante debe tener nombre, DNI y edad para completar la inscripción.',
  ErrorTerminosNoAceptados: '❌ Debés aceptar los términos y condiciones para continuar.',
  ErrorTalleRequerido: '❌ Esta actividad requiere ingresar el talle de vestimenta.',
  ErrorActividadNoValida: '❌ La actividad seleccionada no es válida.',
};

export default function InscripcionPage() {
  const [actividades, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [paso, setPaso] = useState(1);
  const [actividadSel, setActividadSel] = useState(null);
  const [horarioSel, setHorarioSel] = useState('');
  const [visitantes, setVisitantes] = useState([{ ...VISITANTE_VACIO }]);
  const [emailContacto, setEmailContacto] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [inscripcionConfirmada, setInscripcionConfirmada] = useState(null);

  useEffect(() => {
    async function cargarActividades() {
      try {
        setCargandoActividades(true);
        setErrorCarga('');
        const data = await getActividades();
        setActividades(enriquecerActividades(data));
      } catch (err) {
        setErrorCarga('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
        console.error('[API] Error al cargar actividades:', err);
      } finally {
        setCargandoActividades(false);
      }
    }

    cargarActividades();
  }, []);

  const puedeAvanzar = () => {
    setError('');

    switch (paso) {
      case 1:
        return !!actividadSel;
      case 2:
        return !!horarioSel;
      case 3: {
        const faltaDato = visitantes.some(
          visitante =>
            !visitante.nombre ||
            !visitante.dni ||
            !visitante.edad ||
            (actividadSel?.requiereTalle && !visitante.talle)
        );

        if (faltaDato) {
          setError(
            'Completá todos los campos obligatorios.' +
              (actividadSel?.requiereTalle ? ' El talle es obligatorio para esta actividad.' : '')
          );
          return false;
        }

        if (!emailContacto || !emailContacto.includes('@')) {
          setError('Ingresá un email de contacto válido.');
          return false;
        }

        return true;
      }
      case 4:
        return terminosAceptados;
      default:
        return false;
    }
  };

  const avanzar = () => {
    if (puedeAvanzar()) {
      setPaso(pasoActual => pasoActual + 1);
    }
  };

  const retroceder = () => {
    setError('');
    setPaso(pasoActual => pasoActual - 1);
  };

  const confirmar = async () => {
    if (!terminosAceptados) {
      return;
    }

    setError('');
    setCargando(true);

    try {
      const resultado = await postInscripcion({
        actividad: actividadSel.nombre,
        horario: horarioSel,
        visitantes,
        terminosAceptados,
        emailContacto,
      });

      setInscripcionConfirmada({
        idInscripcion: resultado.idInscripcion,
        actividad: actividadSel.nombre,
        emoji: actividadSel.emoji,
        horario: horarioSel,
        totalVisitantes: visitantes.length,
        emailContacto,
      });

      setActividades(prevActividades =>
        prevActividades.map(act => {
          if (act.nombre !== actividadSel.nombre) {
            return act;
          }

          return {
            ...act,
            horarios: act.horarios.map(horario => {
              if (horario.hora !== horarioSel) {
                return horario;
              }

              const nuevosCupos = Math.max(0, horario.cuposDisponibles - visitantes.length);
              return {
                ...horario,
                cuposDisponibles: nuevosCupos,
                disponible: horario.activo && nuevosCupos > 0,
              };
            }),
          };
        })
      );

      try {
        const data = await getActividades();
        setActividades(enriquecerActividades(data));
      } catch (fetchErr) {
        console.error('[API] Error al refrescar actividades:', fetchErr);
      }
    } catch (err) {
      setError(ERROR_MENSAJES[err.name] ?? `❌ ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setActividadSel(null);
    setHorarioSel('');
    setVisitantes([{ ...VISITANTE_VACIO }]);
    setEmailContacto('');
    setTerminosAceptados(false);
    setError('');
    setInscripcionConfirmada(null);
  };

  if (cargandoActividades) {
    return (
      <div
        className="app"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando actividades desde el servidor...</p>
        </div>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div
        className="app"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
      >
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔌</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Sin conexión al servidor</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{errorCarga}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-badge">🌿 Parque Natural - Reservas Online</div>
          <h1>Inscribite a una actividad</h1>
          <p>Completá el formulario para reservar tu lugar</p>
        </header>

        <nav className="steps" aria-label="Progreso del formulario">
          {PASOS.map((item, index) => (
            <div key={item.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step ${paso === item.num ? 'active' : ''} ${paso > item.num ? 'done' : ''}`}>
                <span className="step-num">{paso > item.num ? '✓' : item.num}</span>
                {item.label}
              </div>
              {index < PASOS.length - 1 && <div className="step-divider" />}
            </div>
          ))}
        </nav>

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {paso === 1 && (
          <ActividadSelector
            actividades={actividades}
            seleccionada={actividadSel}
            onSeleccionar={actividad => {
              setActividadSel(actividad);
              setHorarioSel('');
              setTerminosAceptados(false);
            }}
          />
        )}

        {paso === 2 && (
          <HorarioSelector
            actividad={actividadSel}
            horarioSeleccionado={horarioSel}
            onSeleccionar={setHorarioSel}
          />
        )}

        {paso === 3 && (
          <>
            <VisitanteForm actividad={actividadSel} visitantes={visitantes} onChange={setVisitantes} />
            <div className="card">
              <h2 className="card-title">📧 Email de confirmación</h2>
              <p className="card-subtitle">Recibirás los detalles de tu inscripción en este email</p>
              <div className="field">
                <label htmlFor="email-contacto">Email de contacto *</label>
                <input
                  id="email-contacto"
                  type="email"
                  placeholder="Ej: nombre@email.com"
                  value={emailContacto}
                  onChange={event => setEmailContacto(event.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {paso === 4 && (
          <TerminosCondiciones
            actividad={actividadSel}
            aceptado={terminosAceptados}
            onCambiar={setTerminosAceptados}
          />
        )}

        <div className="nav-buttons">
          {paso > 1 ? (
            <button id="btn-anterior" className="btn btn-secondary" onClick={retroceder}>
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          {paso < 4 ? (
            <button
              id="btn-siguiente"
              className="btn btn-primary"
              onClick={avanzar}
              disabled={paso === 1 && !actividadSel}
            >
              Siguiente →
            </button>
          ) : (
            <button
              id="btn-confirmar"
              className="btn btn-success btn-lg"
              onClick={confirmar}
              disabled={!terminosAceptados || cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner" /> Confirmando con el servidor...
                </>
              ) : (
                <>✓ Confirmar inscripción</>
              )}
            </button>
          )}
        </div>
      </div>

      {inscripcionConfirmada && (
        <ConfirmacionModal inscripcion={inscripcionConfirmada} onCerrar={reiniciar} />
      )}
    </div>
  );
}
