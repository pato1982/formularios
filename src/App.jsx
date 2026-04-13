import { useEffect, useMemo, useRef, useState } from 'react'
import { FORMULARIOS } from './formularios/index.js'
import {
  getDrafts, getSubmitted, getCancelled,
  saveDraft, removeDraft, moveDraftToSubmitted, moveDraftToCancelled,
  seedExamples, formatRelative, formatAbsolute,
} from './drafts.js'

function CustomSelect({ name, value, options, onChange, placeholder, disabled, onDisabledClick, hasError }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!ref.current) return
      if (ref.current.contains(e.target)) return
      setOpen(false)
    }
    const escHandler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', handler, true)
    document.addEventListener('mousedown', handler, true)
    document.addEventListener('touchstart', handler, true)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('pointerdown', handler, true)
      document.removeEventListener('mousedown', handler, true)
      document.removeEventListener('touchstart', handler, true)
      document.removeEventListener('keydown', escHandler)
    }
  }, [open])

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger ${!value ? 'placeholder' : ''} ${hasError ? 'error' : ''}`}
        onClick={() => {
          if (disabled) { onDisabledClick && onDisabledClick(); return }
          setOpen((o) => !o)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="custom-select-value">{value || placeholder || 'Selecciona una opcion...'}</span>
        <span className="caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="custom-select-menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              className={`custom-select-option ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Field({ field, value, error, onChange, formData, deps }) {
  const id = `f_${field.name}`
  const [showHelp, setShowHelp] = useState(false)
  const [depError, setDepError] = useState(false)
  const helpRef = useRef(null)

  let dynamicOptions = field.options
  let isDisabled = false
  if (field.dependsOn) {
    const depValue = formData[field.dependsOn]
    const map = deps[field.optionsByDependency]
    if (!depValue) { isDisabled = true }
    else if (map && map[depValue]) { dynamicOptions = map[depValue] }
  }

  useEffect(() => {
    if (field.dependsOn && value) {
      const depValue = formData[field.dependsOn]
      const map = deps[field.optionsByDependency]
      if (map && map[depValue] && !map[depValue].includes(value)) {
        onChange(field.name, '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData[field.dependsOn]])

  useEffect(() => {
    if (!showHelp) return
    const onClick = (e) => {
      if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('touchstart', onClick)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('touchstart', onClick)
    }
  }, [showHelp])

  const common = {
    id,
    name: field.name,
    'aria-invalid': !!error,
    onChange: (e) => {
      const v = field.type === 'file' ? (e.target.files?.[0] || null) : e.target.value
      onChange(field.name, v)
    }
  }

  let control
  if (field.type === 'textarea') {
    control = <textarea {...common} rows={4} value={value || ''} placeholder={field.placeholder || ''} />
  } else if (field.type === 'select') {
    control = (
      <CustomSelect
        name={field.name}
        value={value || ''}
        options={dynamicOptions}
        onChange={(v) => { onChange(field.name, v); setDepError(false) }}
        disabled={isDisabled}
        hasError={depError}
        onDisabledClick={() => {
          setDepError(true)
          setTimeout(() => setDepError(false), 2500)
        }}
        placeholder={isDisabled ? 'Primero selecciona una región' : undefined}
      />
    )
  } else if (field.type === 'radio') {
    control = (
      <div className="radio-group">
        {field.options.map((o) => (
          <label key={o} className={`radio-pill ${value === o ? 'selected' : ''}`}>
            <input
              type="radio"
              name={field.name}
              value={o}
              checked={value === o}
              onChange={() => onChange(field.name, o)}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    )
  } else if (field.type === 'file') {
    control = (
      <label className="file-drop">
        <input type="file" {...common} />
        <span className="file-icon">📎</span>
        <span className="file-text">
          {value ? value.name : 'Toca para subir archivo'}
        </span>
      </label>
    )
  } else {
    control = <input type={field.type} {...common} value={value || ''} placeholder={field.placeholder || ''} />
  }

  return (
    <div className={`field field-${field.size || 'full'} ${field.mobileFull ? 'mobile-full' : ''} ${field.mobileHalf ? 'mobile-half' : ''}`}>
      <label htmlFor={id} className="field-label">
        <span className="field-label-text">
          {field.label}
          {field.required && <span className="required">*</span>}
        </span>
        {field.help && (
          <span className="help-wrap" ref={helpRef}>
            <button
              type="button"
              className="help-icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowHelp((s) => !s) }}
              aria-label="Ver ayuda"
            >!</button>
            {showHelp && (
              <span className="field-help-bubble" role="tooltip">
                {field.help}
                <span className="bubble-arrow" />
              </span>
            )}
          </span>
        )}
      </label>
      {control}
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}

function FormWizard({ formulario, onBack, draftId, initialData, showMissingOnMount, readOnly }) {
  const { steps, deps, nombre } = formulario
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState(initialData || {})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [missingModal, setMissingModal] = useState(null)
  const sessionIdRef = useRef(draftId || `${formulario.id}-${Date.now()}`)
  const createdAtRef = useRef(null)

  const step = steps[stepIdx]
  const progress = ((stepIdx + 1) / steps.length) * 100

  const missingByStep = useMemo(() => {
    return steps.map((s) =>
      s.fields.filter((f) => f.required && (data[f.name] === undefined || data[f.name] === null || data[f.name] === '')).length
    )
  }, [data, steps])

  useEffect(() => {
    if (showMissingOnMount) {
      const incompletos = missingByStep
        .map((count, i) => ({ count, i }))
        .filter((x) => x.count > 0)
      if (incompletos.length > 0) setMissingModal(incompletos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (readOnly) return
    const hasAny = Object.values(data).some((v) => v !== undefined && v !== null && v !== '')
    if (!hasAny) return
    const serializable = {}
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && 'name' in v && 'size' in v) continue
      serializable[k] = v
    }
    saveDraft({
      id: sessionIdRef.current,
      formId: formulario.id,
      formNombre: nombre,
      data: serializable,
      createdAt: createdAtRef.current || undefined,
    })
  }, [data, formulario.id, nombre])

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }))
    setErrors((e) => ({ ...e, [name]: null }))
  }

  const next = () => {
    const isLast = stepIdx === steps.length - 1
    if (isLast) {
      const incompletos = missingByStep
        .map((count, i) => ({ count, i }))
        .filter((x) => x.count > 0)
      if (incompletos.length > 0) {
        setMissingModal(incompletos)
        return
      }
      moveDraftToSubmitted(sessionIdRef.current)
      setSubmitted(true)
    } else {
      setStepIdx(stepIdx + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fieldGroups = useMemo(() => {
    const groups = []
    let current = { title: null, items: [] }
    for (const f of step.fields) {
      if (f.group) {
        if (current.items.length) groups.push(current)
        current = { title: f.group, items: [f] }
      } else {
        current.items.push(f)
      }
    }
    if (current.items.length) groups.push(current)
    return groups
  }, [step])

  if (submitted) {
    return (
      <div className="app">
        <div className="card success">
          <div className="success-icon">✓</div>
          <h1>¡Formulario enviado!</h1>
          <p>Hemos recibido tu información correctamente. Nos pondremos en contacto contigo a la brevedad.</p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onBack}>← Volver al inicio</button>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setStepIdx(0); setData({}) }}>
              Enviar otro
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${readOnly ? 'form-readonly' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">●</div>
          <span>Formulario — {nombre}</span>
        </div>
      </header>
      <button type="button" className="floating-back" onClick={onBack} aria-label="Volver">
        <span aria-hidden="true">←</span>
      </button>

      {readOnly && (
        <div className="readonly-banner">
          <span className="readonly-badge">Sólo lectura</span>
          <span>Estás visualizando un formulario enviado. No es editable.</span>
        </div>
      )}

      <main className="card">
        <div className="steps-indicator" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
          {steps.map((s, i) => {
            const visited = i < stepIdx
            const missing = missingByStep[i] > 0
            const state = i === stepIdx ? 'active' : visited ? (missing ? 'incomplete' : 'done') : ''
            return (
              <div
                key={s.id}
                className={`step-dot ${state}`}
                onClick={() => setStepIdx(i)}
                role="button"
                tabIndex={0}
              >
                <span className="step-num">
                  {state === 'done' ? '✓' : state === 'incomplete' ? '!' : i + 1}
                </span>
                <span className="step-label">{s.title}</span>
              </div>
            )
          })}
        </div>

        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="step-header">
          <h2>{step.title}</h2>
          <p>{step.subtitle}</p>
        </div>

        <form noValidate onSubmit={(e) => { e.preventDefault(); next() }}>
          {fieldGroups.map((g, gi) => (
            <section key={gi} className="group">
              {g.title && <h3 className="group-title">{g.title}</h3>}
              <div className="grid">
                {g.items.map((f) => (
                  <Field
                    key={f.name}
                    field={f}
                    value={data[f.name]}
                    error={errors[f.name]}
                    onChange={handleChange}
                    formData={data}
                    deps={deps}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="actions">
            {stepIdx > 0 && (
              <button type="button" className="btn btn-ghost" onClick={prev}>← Anterior</button>
            )}
            {readOnly ? (
              stepIdx < steps.length - 1 && (
                <button type="button" className="btn btn-primary" onClick={() => { setStepIdx(stepIdx + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                  Siguiente →
                </button>
              )
            ) : (
              <button type="submit" className="btn btn-primary">
                {stepIdx === steps.length - 1 ? 'Enviar formulario' : 'Siguiente →'}
              </button>
            )}
          </div>
        </form>
      </main>

      <footer className="footer">
        Paso {stepIdx + 1} de {steps.length} · Los campos con <span className="required">*</span> son obligatorios
      </footer>

      {missingModal && (
        <div className="modal-backdrop" onClick={() => setMissingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setMissingModal(null)}>×</button>
            <div className="modal-icon">!</div>
            <h2>Faltan campos por completar</h2>
            <p>
              {missingModal.length === 1
                ? `Revisa el ${steps[missingModal[0].i].title}: tiene ${missingModal[0].count} campo${missingModal[0].count > 1 ? 's' : ''} obligatorio${missingModal[0].count > 1 ? 's' : ''} sin llenar.`
                : 'Revisa los siguientes pasos que tienen campos obligatorios sin llenar:'}
            </p>
            {missingModal.length > 1 && (
              <ul className="modal-list">
                {missingModal.map(({ i, count }) => (
                  <li key={i}>
                    <strong>{steps[i].title}</strong> — {count} campo{count > 1 ? 's' : ''} pendiente{count > 1 ? 's' : ''}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setStepIdx(missingModal[0].i)
                  setMissingModal(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Ir al {steps[missingModal[0].i].title}
              </button>
              <button className="btn btn-ghost" onClick={() => setMissingModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormOnePage({ formulario, onBack, draftId, initialData, showMissingOnMount, readOnly }) {
  const { steps, deps, nombre } = formulario
  const [data, setData] = useState(initialData || {})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [missingModal, setMissingModal] = useState(null)
  const [openSections, setOpenSections] = useState(() => new Set(readOnly ? steps.map((s) => s.id) : [steps[0].id]))
  const sessionIdRef = useRef(draftId || `${formulario.id}-${Date.now()}`)

  const toggleSection = (id) => {
    setOpenSections((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }
  const expandAll = () => setOpenSections(new Set(steps.map((s) => s.id)))
  const collapseAll = () => setOpenSections(new Set())

  const missingByStep = useMemo(() => {
    return steps.map((s) =>
      s.fields.filter((f) => f.required && (data[f.name] === undefined || data[f.name] === null || data[f.name] === '')).length
    )
  }, [data, steps])

  const totalRequired = useMemo(
    () => steps.reduce((acc, s) => acc + s.fields.filter((f) => f.required).length, 0),
    [steps]
  )
  const completadosRequired = useMemo(() => {
    let n = 0
    for (const s of steps) {
      for (const f of s.fields) {
        if (f.required && data[f.name]) n++
      }
    }
    return n
  }, [data, steps])
  const progress = totalRequired === 0 ? 0 : (completadosRequired / totalRequired) * 100

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }))
    setErrors((e) => ({ ...e, [name]: null }))
  }

  useEffect(() => {
    if (showMissingOnMount) {
      const incompletos = missingByStep
        .map((count, i) => ({ count, i }))
        .filter((x) => x.count > 0)
      if (incompletos.length > 0) {
        setOpenSections(new Set(incompletos.map((x) => steps[x.i].id)))
        setMissingModal(incompletos)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (readOnly) return
    const hasAny = Object.values(data).some((v) => v !== undefined && v !== null && v !== '')
    if (!hasAny) return
    const serializable = {}
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && 'name' in v && 'size' in v) continue
      serializable[k] = v
    }
    saveDraft({
      id: sessionIdRef.current,
      formId: formulario.id,
      formNombre: nombre,
      data: serializable,
    })
  }, [data, formulario.id, nombre])

  const onSubmit = () => {
    const incompletos = missingByStep
      .map((count, i) => ({ count, i }))
      .filter((x) => x.count > 0)
    if (incompletos.length > 0) {
      setOpenSections(new Set(incompletos.map((x) => steps[x.i].id)))
      setMissingModal(incompletos)
      return
    }
    moveDraftToSubmitted(sessionIdRef.current)
    setSubmitted(true)
  }

  const buildGroups = (stepFields) => {
    const groups = []
    let current = { title: null, items: [] }
    for (const f of stepFields) {
      if (f.group) {
        if (current.items.length) groups.push(current)
        current = { title: f.group, items: [f] }
      } else {
        current.items.push(f)
      }
    }
    if (current.items.length) groups.push(current)
    return groups
  }

  if (submitted) {
    return (
      <div className="app">
        <div className="card success">
          <div className="success-icon">✓</div>
          <h1>¡Formulario enviado!</h1>
          <p>Hemos recibido tu información correctamente. Nos pondremos en contacto contigo a la brevedad.</p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onBack}>← Volver al inicio</button>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setData({}) }}>
              Enviar otro
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${readOnly ? 'form-readonly' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">●</div>
          <span>Formulario — {nombre}</span>
        </div>
      </header>
      <button type="button" className="floating-back" onClick={onBack} aria-label="Volver">
        <span aria-hidden="true">←</span>
      </button>

      {readOnly && (
        <div className="readonly-banner">
          <span className="readonly-badge">Sólo lectura</span>
          <span>Estás visualizando un formulario enviado. No es editable.</span>
        </div>
      )}

      <main className="card">
        <div className="step-header">
          <h2>Completa el formulario</h2>
          <p>Todas las secciones están disponibles. Haz clic en cada sección para expandirla.</p>
        </div>

        <div className="onepage-toolbar">
          <div className="progress-info">
            <span>{completadosRequired} de {totalRequired} obligatorios</span>
          </div>
          <div className="onepage-actions-top">
            <button type="button" className="btn btn-ghost btn-mini" onClick={expandAll}>Expandir todo</button>
            <button type="button" className="btn btn-ghost btn-mini" onClick={collapseAll}>Colapsar todo</button>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
          {steps.map((s, i) => {
            const isOpen = openSections.has(s.id)
            const missing = missingByStep[i]
            return (
              <section key={s.id} className={`accordion ${isOpen ? 'open' : ''} ${missing > 0 ? 'has-missing' : ''}`}>
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => toggleSection(s.id)}
                  aria-expanded={isOpen}
                >
                  <div className="accordion-title">
                    <span className={`accordion-badge ${missing > 0 ? 'incomplete' : missing === 0 && s.fields.some((f) => f.required && data[f.name]) ? 'partial' : ''}`}>
                      {i + 1}
                    </span>
                    <div>
                      <strong>{s.title}</strong>
                      <small>{s.subtitle}</small>
                    </div>
                  </div>
                  <div className="accordion-meta">
                    {missing > 0
                      ? <span className="accordion-tag missing">{missing} pendiente{missing > 1 ? 's' : ''}</span>
                      : <span className="accordion-tag ok">Completo</span>}
                    <span className="accordion-chevron">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="accordion-body">
                    {buildGroups(s.fields).map((g, gi) => (
                      <div key={gi} className="group">
                        {g.title && <h3 className="group-title">{g.title}</h3>}
                        <div className="grid">
                          {g.items.map((f) => (
                            <Field
                              key={f.name}
                              field={f}
                              value={data[f.name]}
                              error={errors[f.name]}
                              onChange={handleChange}
                              formData={data}
                              deps={deps}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          {!readOnly && (
            <div className="actions">
              <button type="submit" className="btn btn-primary">Enviar formulario</button>
            </div>
          )}
        </form>
      </main>

      <footer className="footer">
        Los campos con <span className="required">*</span> son obligatorios
      </footer>

      {missingModal && (
        <div className="modal-backdrop" onClick={() => setMissingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setMissingModal(null)}>×</button>
            <div className="modal-icon">!</div>
            <h2>Faltan campos por completar</h2>
            <p>
              {missingModal.length === 1
                ? `Revisa la sección "${steps[missingModal[0].i].title}": tiene ${missingModal[0].count} campo${missingModal[0].count > 1 ? 's' : ''} obligatorio${missingModal[0].count > 1 ? 's' : ''} sin llenar.`
                : 'Revisa las siguientes secciones que tienen campos obligatorios sin llenar:'}
            </p>
            {missingModal.length > 1 && (
              <ul className="modal-list">
                {missingModal.map(({ i, count }) => (
                  <li key={i}>
                    <strong>{steps[i].title}</strong> — {count} campo{count > 1 ? 's' : ''} pendiente{count > 1 ? 's' : ''}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setMissingModal(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function Selector({ onSelect, onResumeDraft }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState('selector')
  const [listVersion, setListVersion] = useState(0)
  const [confirmCancel, setConfirmCancel] = useState(null)

  useEffect(() => { seedExamples(FORMULARIOS) }, [])

  const drafts = useMemo(() => getDrafts(), [view, menuOpen, listVersion])
  const submittedList = useMemo(() => getSubmitted(), [view, menuOpen, listVersion])
  const cancelledList = useMemo(() => getCancelled(), [view, menuOpen, listVersion])

  const openSection = (s) => { setView(s); setMenuOpen(false) }
  const backToSelector = () => setView('selector')
  const closeMenu = () => setMenuOpen(false)

  const handleResume = (draft) => {
    const f = FORMULARIOS.find((x) => x.id === draft.formId)
    if (!f) return
    closeMenu()
    onResumeDraft({ formulario: f, draftId: draft.id, initialData: draft.data, showMissing: true })
  }

  const handleViewSubmitted = (entry) => {
    const f = FORMULARIOS.find((x) => x.id === entry.formId)
    if (!f) return
    closeMenu()
    onResumeDraft({ formulario: f, draftId: null, initialData: entry.data, showMissing: false, readOnly: true })
  }

  const requestCancel = (draft) => setConfirmCancel(draft)
  const confirmCancelDraft = () => {
    if (!confirmCancel) return
    moveDraftToCancelled(confirmCancel.id)
    setConfirmCancel(null)
    setListVersion((v) => v + 1)
  }

  return (
    <div className="app app-selector">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">●</div>
          <span>Centro de formularios</span>
        </div>
        {view !== 'selector' && (
          <div className="topbar-title">
            <h1>
              {view === 'pendientes' && 'Formularios pendientes'}
              {view === 'enviados' && 'Formularios enviados'}
              {view === 'cancelados' && 'Formularios cancelados'}
            </h1>
            <p>
              {view === 'pendientes' && 'Continúe un trámite iniciado previamente'}
              {view === 'enviados' && 'Historial de registros remitidos'}
              {view === 'cancelados' && 'Solicitudes descartadas'}
            </p>
          </div>
        )}
        <button type="button" className="menu-toggle" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
          <span className="menu-toggle-text">Menu</span>
          <span className="menu-toggle-icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </header>

      {menuOpen && (
        <div className="modal-backdrop" onClick={closeMenu}>
          <div className="modal menu-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="menu-modal-close" aria-label="Cerrar" onClick={closeMenu}>×</button>
            <div className="menu-modal-header">
              <span className="menu-modal-eyebrow">Panel de control</span>
              <h2>Gestión de formularios</h2>
              <p className="menu-modal-sub">Seleccione una categoría para continuar</p>
            </div>
            <ul className="menu-modal-list">
              <li>
                <button type="button" onClick={() => openSection('pendientes')}>
                  <span className="menu-item-title">Formularios pendientes</span>
                  <span className="menu-item-desc">{drafts.length} en curso por completar</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openSection('enviados')}>
                  <span className="menu-item-title">Formularios enviados</span>
                  <span className="menu-item-desc">{submittedList.length} registros remitidos</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openSection('cancelados')}>
                  <span className="menu-item-title">Formularios cancelados</span>
                  <span className="menu-item-desc">{cancelledList.length} solicitudes anuladas</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {view === 'selector' && (
        <main className="card selector">
          <div className="selector-header">
            <h1>¿Qué formulario necesitas?</h1>
            <p>Selecciona el formulario que corresponda a tu trámite.</p>
          </div>

          <div className="selector-grid">
            {FORMULARIOS.map((f) => (
              <button key={f.id} className="form-card" onClick={() => onSelect(f)}>
                <div className="form-card-icon">{f.icono}</div>
                <h3>{f.nombre}</h3>
                <p>{f.descripcion}</p>
                <div className="form-card-meta">
                  <span>📋 {f.pasos} sección{f.pasos > 1 ? 'es' : ''}</span>
                  <span>🎛 {f.formato}</span>
                </div>
                <div className="form-card-cta">Comenzar →</div>
              </button>
            ))}
          </div>
        </main>
      )}

      {view === 'pendientes' && (() => {
        const times = drafts.map((d) => new Date(d.createdAt).getTime()).filter((t) => !isNaN(t))
        const mostRecent = times.length ? new Date(Math.max(...times)) : null
        const oldest = times.length ? new Date(Math.min(...times)) : null
        const DAY = 86400000
        const staleCount = drafts.filter((d) => {
          const t = new Date(d.createdAt).getTime()
          return !isNaN(t) && (Date.now() - t) > 7 * DAY
        }).length
        return (
          <main className="card menu-page menu-page-split">
            <aside className="menu-page-side">
              <div className="menu-page-side-top">
                <button type="button" className="menu-back menu-back-inline" onClick={backToSelector} aria-label="Volver">←</button>
                <h1 className="menu-page-mobile-title">
                  {view === 'pendientes' && 'Formularios pendientes'}
                  {view === 'enviados' && 'Formularios enviados'}
                  {view === 'cancelados' && 'Formularios cancelados'}
                </h1>
              </div>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Pendientes</span>
                  <span className="kpi-value">{drafts.length}</span>
                  <span className="kpi-hint">Total en curso</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Sin actividad &gt; 7 días</span>
                  <span className="kpi-value">{staleCount}</span>
                  <span className="kpi-hint">Requieren atención</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más reciente</span>
                  <span className="kpi-value-sm">{mostRecent ? formatAbsolute(mostRecent.toISOString()) : '—'}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más antiguo</span>
                  <span className="kpi-value-sm">{oldest ? formatAbsolute(oldest.toISOString()) : '—'}</span>
                </div>
              </div>
            </aside>
            <section className="menu-page-main">
              {drafts.length === 0 ? (
                <div className="menu-empty">No hay formularios pendientes.</div>
              ) : (
                <ul className="draft-list">
                  {drafts.map((d) => (
                    <li key={d.id}>
                      <button type="button" className="draft-item" onClick={() => handleResume(d)}>
                        <div className="draft-item-main">
                          <span className="draft-item-title">Formulario de contratación</span>
                          <span className="draft-item-date">{formatAbsolute(d.createdAt)}</span>
                        </div>
                        <span className="draft-item-cta">Reanudar →</span>
                      </button>
                      <button
                        type="button"
                        className="draft-item-cancel"
                        onClick={(e) => { e.stopPropagation(); requestCancel(d) }}
                        aria-label="Eliminar borrador"
                      >×</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        )
      })()}

      {view === 'enviados' && (() => {
        const times = submittedList.map((d) => new Date(d.submittedAt).getTime()).filter((t) => !isNaN(t))
        const mostRecent = times.length ? new Date(Math.max(...times)) : null
        const oldest = times.length ? new Date(Math.min(...times)) : null
        const DAY = 86400000
        const last7 = submittedList.filter((d) => {
          const t = new Date(d.submittedAt).getTime()
          return !isNaN(t) && (Date.now() - t) <= 7 * DAY
        }).length
        return (
          <main className="card menu-page menu-page-split">
            <aside className="menu-page-side">
              <div className="menu-page-side-top">
                <button type="button" className="menu-back menu-back-inline" onClick={backToSelector} aria-label="Volver">←</button>
                <h1 className="menu-page-mobile-title">
                  {view === 'pendientes' && 'Formularios pendientes'}
                  {view === 'enviados' && 'Formularios enviados'}
                  {view === 'cancelados' && 'Formularios cancelados'}
                </h1>
              </div>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Enviados</span>
                  <span className="kpi-value">{submittedList.length}</span>
                  <span className="kpi-hint">Total histórico</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Últimos 7 días</span>
                  <span className="kpi-value">{last7}</span>
                  <span className="kpi-hint">Actividad reciente</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más reciente</span>
                  <span className="kpi-value-sm">{mostRecent ? formatAbsolute(mostRecent.toISOString()) : '—'}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más antiguo</span>
                  <span className="kpi-value-sm">{oldest ? formatAbsolute(oldest.toISOString()) : '—'}</span>
                </div>
              </div>
            </aside>
            <section className="menu-page-main">
              {submittedList.length === 0 ? (
                <div className="menu-empty">Aún no hay formularios enviados.</div>
              ) : (
                <ul className="draft-list">
                  {submittedList.map((d) => (
                    <li key={d.id}>
                      <button type="button" className="draft-item" onClick={() => handleViewSubmitted(d)}>
                        <div className="draft-item-main">
                          <span className="draft-item-title">Formulario de contratación</span>
                          <span className="draft-item-date">{formatAbsolute(d.submittedAt)}</span>
                        </div>
                        <span className="draft-badge ok">Completado</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        )
      })()}

      {view === 'cancelados' && (() => {
        const times = cancelledList.map((d) => new Date(d.cancelledAt).getTime()).filter((t) => !isNaN(t))
        const mostRecent = times.length ? new Date(Math.max(...times)) : null
        const oldest = times.length ? new Date(Math.min(...times)) : null
        const DAY = 86400000
        const last7 = cancelledList.filter((d) => {
          const t = new Date(d.cancelledAt).getTime()
          return !isNaN(t) && (Date.now() - t) <= 7 * DAY
        }).length
        return (
          <main className="card menu-page menu-page-split">
            <aside className="menu-page-side">
              <div className="menu-page-side-top">
                <button type="button" className="menu-back menu-back-inline" onClick={backToSelector} aria-label="Volver">←</button>
                <h1 className="menu-page-mobile-title">
                  {view === 'pendientes' && 'Formularios pendientes'}
                  {view === 'enviados' && 'Formularios enviados'}
                  {view === 'cancelados' && 'Formularios cancelados'}
                </h1>
              </div>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Cancelados</span>
                  <span className="kpi-value">{cancelledList.length}</span>
                  <span className="kpi-hint">Total anulados</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Últimos 7 días</span>
                  <span className="kpi-value">{last7}</span>
                  <span className="kpi-hint">Anulaciones recientes</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más reciente</span>
                  <span className="kpi-value-sm">{mostRecent ? formatAbsolute(mostRecent.toISOString()) : '—'}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Más antiguo</span>
                  <span className="kpi-value-sm">{oldest ? formatAbsolute(oldest.toISOString()) : '—'}</span>
                </div>
              </div>
            </aside>
            <section className="menu-page-main">
              {cancelledList.length === 0 ? (
                <div className="menu-empty">No hay formularios cancelados.</div>
              ) : (
                <ul className="draft-list">
                  {cancelledList.map((d) => (
                    <li key={d.id}>
                      <div className="draft-item as-readonly">
                        <div className="draft-item-main">
                          <span className="draft-item-title">Formulario de contratación</span>
                          <span className="draft-item-date">{formatAbsolute(d.cancelledAt)}</span>
                        </div>
                        <span className="draft-badge cancelled">Anulado</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        )
      })()}

      {confirmCancel && (
        <div className="modal-backdrop confirm-layer" onClick={() => setConfirmCancel(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setConfirmCancel(null)}>×</button>
            <div className="confirm-icon" aria-hidden="true">!</div>
            <span className="confirm-eyebrow">Confirmar eliminación</span>
            <h2>¿Eliminar este formulario?</h2>
            <p>
              Está a punto de eliminar <strong>Formulario de contratación</strong> del {formatAbsolute(confirmCancel.createdAt)}. Esta acción no se puede deshacer.
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmCancel(null)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={confirmCancelDraft}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer selector-footer">
        <ul className="selector-footer-nav">
          <li><a href="#" className="active">Formulario</a></li>
          <li><a href="#">Estadísticas</a></li>
          <li><a href="#">Configuración</a></li>
        </ul>
      </footer>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)

  const start = (formulario) => setSession({ formulario, draftId: null, initialData: null, showMissing: false, readOnly: false })
  const resume = ({ formulario, draftId, initialData, showMissing, readOnly }) =>
    setSession({ formulario, draftId, initialData, showMissing, readOnly: !!readOnly })
  const back = () => setSession(null)

  if (!session) {
    return <Selector onSelect={start} onResumeDraft={resume} />
  }
  const Vista = session.formulario.layout === 'onepage' ? FormOnePage : FormWizard
  return (
    <Vista
      formulario={session.formulario}
      onBack={back}
      draftId={session.draftId}
      initialData={session.initialData}
      showMissingOnMount={session.showMissing}
      readOnly={session.readOnly}
    />
  )
}
