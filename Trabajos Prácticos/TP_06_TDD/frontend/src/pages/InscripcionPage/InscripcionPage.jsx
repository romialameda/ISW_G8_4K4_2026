import { useState, useEffect } from 'react';
import ConfirmacionModal from '../../components/ConfirmacionModal/ConfirmacionModal';
import { getActividades, postInscripcion } from '../../services/api';
import { enriquecerActividades, TALLES } from '../../data/actividadesData';

const VISITANTE_VACIO = { nombre: '', dni: '', edad: '', talle: '' };

const ERROR_MENSAJES = {
  ErrorSinCupos:                 '❌ No hay cupos disponibles para el horario seleccionado.',
  ErrorHorarioNoDisponible:      '❌ El horario seleccionado no está disponible o el parque está cerrado.',
  ErrorSinParticipantes:         '❌ Debés indicar al menos una persona para realizar la inscripción.',
  ErrorDatosVisitanteIncompletos:'❌ Cada visitante debe tener nombre, DNI y edad.',
  ErrorTerminosNoAceptados:      '❌ Debés aceptar los términos y condiciones para continuar.',
  ErrorTalleRequerido:           '❌ Esta actividad requiere ingresar el talle de vestimenta.',
  ErrorActividadNoValida:        '❌ La actividad seleccionada no es válida.',
  ErrorEdadInvalida:             '❌ La edad de cada visitante debe estar entre 0 y 99 años.',
  ErrorDniInvalido:              '❌ El DNI debe tener formato argentino (7 u 8 dígitos numéricos).',
};

export default function InscripcionPage() {
  const [actividades, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [actividadSel, setActividadSel] = useState(null);
  const [horarioSel, setHorarioSel] = useState('');
  const [cantidadVisitantes, setCantidadVisitantes] = useState(0);
  const [visitantes, setVisitantes] = useState([]);
  const [emailContacto, setEmailContacto] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState('');
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

  // ── Visitantes ──────────────────────────────────────────────────────────────
  const cambiarCantidadVisitantes = (nuevaCantidad) => {
    const n = Math.max(0, Math.min(10, Number(nuevaCantidad)));
    if (isNaN(n)) return;
    setCantidadVisitantes(n);
    setVisitantes(prev => {
      if (n > prev.length) {
        return [...prev, ...Array(n - prev.length).fill(null).map(() => ({ ...VISITANTE_VACIO }))];
      }
      return prev.slice(0, n);
    });
    // Limpiar errores de visitantes que ya no existen
    setErrores(e => {
      const nuevo = { ...e };
      Object.keys(nuevo).forEach(k => {
        if (k.startsWith('visitante_')) {
          const idx = parseInt(k.split('_')[1], 10);
          if (idx >= n) delete nuevo[k];
        }
      });
      return nuevo;
    });
  };

  const actualizarVisitante = (idx, campo, valor) => {
    setVisitantes(v => v.map((vis, i) => i === idx ? { ...vis, [campo]: valor } : vis));
    // Limpiar error puntual al editar
    setErrores(e => { const n = { ...e }; delete n[`visitante_${idx}_${campo}`]; return n; });
  };

  // ── Validación ──────────────────────────────────────────────────────────────
  const validar = () => {
    const errs = {};

    if (!actividadSel) {
      errs.actividad = 'Seleccioná una actividad.';
    }

    if (!horarioSel) {
      errs.horario = 'Seleccioná un horario.';
    } else {
      const [h, m] = horarioSel.split(':').map(Number);
      const total = h * 60 + m;
      if (total < 510 || total > 1140) { // 08:30 = 510, 19:00 = 1140
        errs.horario = 'El horario debe estar entre 08:30 y 19:00.';
      }
    }

    visitantes.forEach((v, idx) => {
      if (!v.nombre?.trim()) errs[`visitante_${idx}_nombre`] = 'Nombre requerido.';
      if (!v.dni?.trim()) {
        errs[`visitante_${idx}_dni`] = 'DNI requerido.';
      } else if (!/^\d{7,8}$/.test(v.dni.trim())) {
        errs[`visitante_${idx}_dni`] = 'DNI debe tener 7 o 8 dígitos.';
      }

      if (v.edad === '' || v.edad === null || v.edad === undefined) {
        errs[`visitante_${idx}_edad`] = 'Edad requerida.';
      } else {
        const edadNum = Number(v.edad);
        if (isNaN(edadNum) || edadNum < 0 || edadNum > 99) {
          errs[`visitante_${idx}_edad`] = 'Edad debe ser entre 0 y 99.';
        }
      }

      if (actividadSel?.requiereTalle && !v.talle) {
        errs[`visitante_${idx}_talle`] = 'Talle requerido para esta actividad.';
      }
    });

    if (!emailContacto || !emailContacto.includes('@')) {
      errs.email = 'Ingresá un email de contacto válido.';
    }

    if (!terminosAceptados) {
      errs.terminos = 'Debés aceptar los términos y condiciones.';
    }

    return errs;
  };

  // ── Confirmación ─────────────────────────────────────────────────────────────
  const confirmar = async () => {
    setErrorGlobal('');
    const errs = validar();

    if (errs.horario === 'El horario debe estar entre 08:30 y 19:00.') {
      setErrorGlobal('⚠️ El horario debe estar entre 08:30 y 19:00.');
      errs.horario = '';
    }

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      // Scroll al primer error
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrores({});
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

      try {
        const data = await getActividades();
        setActividades(enriquecerActividades(data));
      } catch { /* ignorar error de refresco */ }
    } catch (err) {
      setErrorGlobal(ERROR_MENSAJES[err.name] ?? `❌ ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Reiniciar ────────────────────────────────────────────────────────────────
  const reiniciar = () => {
    setActividadSel(null);
    setHorarioSel('');
    setCantidadVisitantes(0);
    setVisitantes([]);
    setEmailContacto('');
    setTerminosAceptados(false);
    setErrores({});
    setErrorGlobal('');
    setInscripcionConfirmada(null);
  };

  // ── Loading / Error de carga ─────────────────────────────────────────────────
  if (cargandoActividades) {
    return (
      <div className="app" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
        <div style={{ textAlign:'center' }}>
          <div className="spinner" style={{ width:40, height:40, margin:'0 auto 1rem', borderWidth:3 }} />
          <p style={{ color:'var(--text-secondary)' }}>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="app" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
        <div className="card" style={{ maxWidth:480, textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔌</div>
          <h2 style={{ marginBottom:'0.5rem' }}>Sin conexión al servidor</h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:'1.5rem' }}>{errorCarga}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  const actividadSeleccionada = actividadSel;
  const horariosDisponibles = actividadSeleccionada?.horarios ?? [];

  return (
    <div className="app">
      <div className="container">
        {/* ── Header ──────────────────────────────────────── */}
        <header className="header">
          <div className="header-badge">🌿 EcoHarmony Park — Reservas Online</div>
          <h1>Inscribite a una actividad</h1>
          <p>Completá el formulario y confirmá tu inscripción</p>
        </header>

        {/* ════════════════════════════════════════════════════
            SECCIÓN 1 — ACTIVIDAD
            ════════════════════════════════════════════════ */}
        <section className="card" id="field-actividad">
          <h2 className="card-title">🎯 1. Elegí una actividad</h2>
          <p className="card-subtitle">Solo se muestran actividades disponibles</p>
          <div className="actividades-grid">
            {actividades.map(act => {
              const tieneAlgunCupo = act.horarios.some(h => h.disponible);
              return (
                <button
                  key={act.nombre}
                  id={`actividad-${act.nombre.toLowerCase().replace('í','i')}`}
                  className={`actividad-card ${actividadSel?.nombre === act.nombre ? 'selected' : ''}`}
                  style={{ '--act-color': act.color, opacity: tieneAlgunCupo ? 1 : 0.55 }}
                  onClick={() => {
                    if (!tieneAlgunCupo) return;
                    setActividadSel(act);
                    setHorarioSel('');
                    setErrores(e => { const n={...e}; delete n.actividad; delete n.horario; return n; });
                  }}
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
                    <div style={{ marginTop:'0.5rem', fontSize:'0.7rem', color:'var(--danger)', fontWeight:700 }}>
                      Sin cupos disponibles
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errores.actividad && <p className="field-error" style={{ marginTop:'0.75rem' }}>⚠️ {errores.actividad}</p>}
        </section>

        {/* ════════════════════════════════════════════════════
            SECCIÓN 2 — HORARIO
            ════════════════════════════════════════════════ */}
        <section className="card" id="field-horario">
          <h2 className="card-title">🕙 2. Seleccioná un horario</h2>
          <p className="card-subtitle">
            {actividadSel
              ? `Horarios disponibles para ${actividadSel.nombre}`
              : 'Primero seleccioná una actividad para ver sus horarios'}
          </p>
          {actividadSel ? (
            <div className="horarios-grid">
              {horariosDisponibles.map(h => {
                const isDisabled = !h.activo;
                const getCuposClass = (c) => c === 0 ? 'sin-cupo' : c <= 3 ? 'pocos' : 'ok';
                const getCuposLabel = (c, a) => !a ? 'No disponible' : c === 0 ? 'Sin cupos' : c === 1 ? '1 cupo' : `${c} cupos`;
                return (
                  <button
                    key={h.hora}
                    id={`horario-${h.hora.replace(':','')}`}
                    className={`horario-btn ${horarioSel === h.hora ? 'selected' : ''}`}
                    onClick={() => {
                      if (isDisabled) return;
                      setHorarioSel(h.hora);
                      setErrores(e => { const n={...e}; delete n.horario; return n; });
                    }}
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
          ) : (
            <div className="horario-placeholder">
              <span>🗓️</span>
              <p>Los horarios aparecerán aquí una vez que elijas una actividad</p>
            </div>
          )}
          {errores.horario && <p className="field-error" style={{ marginTop:'0.75rem' }}>⚠️ {errores.horario}</p>}
        </section>

        {/* ════════════════════════════════════════════════════
            SECCIÓN 3 — VISITANTES
            ════════════════════════════════════════════════ */}
        <section className="card">
          <h2 className="card-title">👥 3. Datos de los visitantes</h2>
          <p className="card-subtitle">
            {actividadSel?.requiereTalle
              ? '⚠️ Esta actividad requiere ingresar el talle de vestimenta'
              : actividadSel
                ? '✓ Esta actividad no requiere talle de vestimenta'
                : 'Indicá cuántas personas asistirán y completá sus datos'}
          </p>

          {/* Selector de cantidad */}
          <div className="cantidad-visitantes-row">
            <div className="field" id="field-cantidadVisitantes">
              <label htmlFor="cantidad-visitantes">¿Cuántas personas van a asistir? *</label>
              <div className="cantidad-visitantes-control">
                <button
                  type="button"
                  id="btn-menos-visitantes"
                  className="cantidad-btn"
                  onClick={() => cambiarCantidadVisitantes(cantidadVisitantes - 1)}
                  disabled={cantidadVisitantes <= 0}
                  aria-label="Restar visitante"
                >−</button>
                <input
                  id="cantidad-visitantes"
                  type="number"
                  min={0}
                  max={10}
                  value={cantidadVisitantes}
                  onChange={e => cambiarCantidadVisitantes(e.target.value)}
                  className="cantidad-input"
                />
                <button
                  type="button"
                  id="btn-mas-visitantes"
                  className="cantidad-btn"
                  onClick={() => cambiarCantidadVisitantes(cantidadVisitantes + 1)}
                  disabled={cantidadVisitantes >= 10}
                  aria-label="Sumar visitante"
                >＋</button>
                <span className="cantidad-label">
                  {cantidadVisitantes === 1 ? '1 persona' : `${cantidadVisitantes} personas`}
                </span>
              </div>
            </div>
          </div>

          {/* Campos por visitante */}
          {visitantes.map((visitante, idx) => (
            <div key={idx} className="visitante-block">
              <div className="visitante-block-title">
                <span>👤</span> Visitante {idx + 1}
              </div>

              <div className="form-grid cols-3">
                <div className="field" id={`field-visitante_${idx}_nombre`}>
                  <label htmlFor={`nombre-${idx}`}>Nombre completo *</label>
                  <input
                    id={`nombre-${idx}`}
                    type="text"
                    placeholder="Ej: Ana García"
                    value={visitante.nombre}
                    onChange={e => actualizarVisitante(idx, 'nombre', e.target.value)}
                    className={errores[`visitante_${idx}_nombre`] ? 'error' : ''}
                  />
                  {errores[`visitante_${idx}_nombre`] && (
                    <span className="field-error">{errores[`visitante_${idx}_nombre`]}</span>
                  )}
                </div>

                <div className="field" id={`field-visitante_${idx}_dni`}>
                  <label htmlFor={`dni-${idx}`}>DNI *</label>
                  <input
                    id={`dni-${idx}`}
                    type="text"
                    placeholder="Ej: 12345678"
                    value={visitante.dni}
                    onChange={e => actualizarVisitante(idx, 'dni', e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                    className={errores[`visitante_${idx}_dni`] ? 'error' : ''}
                  />
                  {errores[`visitante_${idx}_dni`] && (
                    <span className="field-error">{errores[`visitante_${idx}_dni`]}</span>
                  )}
                </div>

                <div className="field" id={`field-visitante_${idx}_edad`}>
                  <label htmlFor={`edad-${idx}`}>Edad * (0–99)</label>
                  <input
                    id={`edad-${idx}`}
                    type="number"
                    placeholder="Ej: 25"
                    value={visitante.edad}
                    min={0} max={99}
                    onChange={e => actualizarVisitante(idx, 'edad', e.target.value)}
                    className={errores[`visitante_${idx}_edad`] ? 'error' : ''}
                  />
                  {errores[`visitante_${idx}_edad`] && (
                    <span className="field-error">{errores[`visitante_${idx}_edad`]}</span>
                  )}
                </div>
              </div>
              <div className="form-grid" style={{ marginTop:'1rem' }}>
                <div className="field" id={`field-visitante_${idx}_talle`}>
                  <label htmlFor={`talle-${idx}`}>
                    {actividadSel?.requiereTalle ? 'Talle de vestimenta *' : 'Talle de vestimenta (opcional)'}
                  </label>
                  <select
                    id={`talle-${idx}`}
                    value={visitante.talle}
                    onChange={e => actualizarVisitante(idx, 'talle', e.target.value)}
                    className={errores[`visitante_${idx}_talle`] ? 'error' : ''}
                  >
                    <option value="">Seleccioná un talle</option>
                    {TALLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errores[`visitante_${idx}_talle`] && (
                    <span className="field-error">{errores[`visitante_${idx}_talle`]}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ════════════════════════════════════════════════════
            SECCIÓN 4 — EMAIL DE CONTACTO
            ════════════════════════════════════════════════ */}
        <section className="card" id="field-email">
          <h2 className="card-title">📧 4. Email de confirmación</h2>
          <p className="card-subtitle">Recibirás los detalles de tu inscripción en este email</p>
          <div className="field">
            <label htmlFor="email-contacto">Email de contacto *</label>
            <input
              id="email-contacto"
              type="email"
              placeholder="Ej: nombre@email.com"
              value={emailContacto}
              onChange={e => {
                setEmailContacto(e.target.value);
                setErrores(err => { const n={...err}; delete n.email; return n; });
              }}
              className={errores.email ? 'error' : ''}
              style={{ maxWidth: 400 }}
            />
            {errores.email && <span className="field-error">{errores.email}</span>}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECCIÓN 5 — TÉRMINOS Y CONDICIONES
            ════════════════════════════════════════════════ */}
        {actividadSel && (
          <section className="card" id="field-terminos">
            <h2 className="card-title">📋 5. Términos y condiciones</h2>
            <p className="card-subtitle">
              Leé los términos específicos de <strong>{actividadSel.nombre}</strong> antes de confirmar
            </p>
            <div className="terminos-box" id="terminos-texto">
              {actividadSel.terminosYCondiciones}
            </div>
            <label
              className={`terminos-check ${terminosAceptados ? 'checked' : ''} ${errores.terminos ? 'error-check' : ''}`}
              id="label-terminos"
              htmlFor="checkbox-terminos"
            >
              <input
                type="checkbox"
                id="checkbox-terminos"
                checked={terminosAceptados}
                onChange={e => {
                  setTerminosAceptados(e.target.checked);
                  setErrores(err => { const n={...err}; delete n.terminos; return n; });
                }}
              />
              <span className="check-visual">{terminosAceptados ? '✓' : ''}</span>
              <span className="terminos-check-text">
                Acepto los términos y condiciones de <strong>{actividadSel.nombre}</strong>
              </span>
            </label>
            {errores.terminos && <p className="field-error" style={{ marginTop:'0.5rem' }}>⚠️ {errores.terminos}</p>}
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            BOTÓN CONFIRMAR
            ════════════════════════════════════════════════ */}
        <div className="nav-buttons" style={{ justifyContent:'flex-end', borderTop:'none', paddingBottom:'3rem' }}>
          <button
            id="btn-confirmar"
            className="btn btn-success btn-lg"
            onClick={confirmar}
            disabled={cargando}
          >
            {cargando ? (
              <><span className="spinner" /> Confirmando con el servidor...</>
            ) : (
              <>✓ Confirmar inscripción</>
            )}
          </button>
        </div>
      </div>

      {/* ── Toast de error global (fixed) ──────────────── */}
      {errorGlobal && (
        <div className="toast-error" role="alert">
          <span className="toast-icon">⚠️</span>
          <span className="toast-msg">{errorGlobal}</span>
          <button
            className="toast-close"
            onClick={() => setErrorGlobal('')}
            aria-label="Cerrar error"
          >×</button>
        </div>
      )}

      {/* ── Modal de confirmación ──────────────────────────── */}
      {inscripcionConfirmada && (
        <ConfirmacionModal inscripcion={inscripcionConfirmada} onCerrar={reiniciar} />
      )}
    </div>
  );
}
