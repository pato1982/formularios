const DRAFTS_KEY = 'form_drafts_v1'
const SUBMITTED_KEY = 'form_submitted_v1'
const CANCELLED_KEY = 'form_cancelled_v1'
const SEED_KEY = 'form_drafts_seeded_v5'
const GENERIC_NAME = 'Formulario de contratación'

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function write(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

export function getDrafts() {
  return read(DRAFTS_KEY).sort((a, b) => b.updatedAt - a.updatedAt)
}
export function getSubmitted() {
  return read(SUBMITTED_KEY).sort((a, b) => b.updatedAt - a.updatedAt)
}
export function getCancelled() {
  return read(CANCELLED_KEY).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveDraft(entry) {
  const all = read(DRAFTS_KEY)
  const idx = all.findIndex((d) => d.id === entry.id)
  const now = Date.now()
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...entry, updatedAt: now }
  } else {
    all.push({ ...entry, createdAt: entry.createdAt || now, updatedAt: now })
  }
  write(DRAFTS_KEY, all)
}

export function removeDraft(id) {
  write(DRAFTS_KEY, read(DRAFTS_KEY).filter((d) => d.id !== id))
}

export function moveDraftToSubmitted(id) {
  const all = read(DRAFTS_KEY)
  const found = all.find((d) => d.id === id)
  if (!found) return
  write(DRAFTS_KEY, all.filter((d) => d.id !== id))
  const submitted = read(SUBMITTED_KEY)
  submitted.push({ ...found, submittedAt: Date.now() })
  write(SUBMITTED_KEY, submitted)
}

export function moveDraftToCancelled(id) {
  const all = read(DRAFTS_KEY)
  const found = all.find((d) => d.id === id)
  if (!found) return
  write(DRAFTS_KEY, all.filter((d) => d.id !== id))
  const cancelled = read(CANCELLED_KEY)
  cancelled.push({ ...found, cancelledAt: Date.now() })
  write(CANCELLED_KEY, cancelled)
}

export function seedExamples(formularios) {
  if (localStorage.getItem(SEED_KEY)) return
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const buildPartial = (f, count = 2) => {
    const firstStep = f.steps[0]
    const partial = {}
    if (!firstStep) return partial
    firstStep.fields.slice(0, count).forEach((fld) => {
      if (fld.type === 'text') partial[fld.name] = 'Juan Pérez'
      else if (fld.type === 'email') partial[fld.name] = 'juan.perez@empresa.cl'
      else if (fld.type === 'tel') partial[fld.name] = '+56 9 1234 5678'
    })
    return partial
  }

  const pickForm = (i) => formularios[i % formularios.length]

  const drafts = read(DRAFTS_KEY).filter((d) => !String(d.id).startsWith('seed-'))
  const pendingOffsets = [1, 3, 7, 12, 18, 25, 34, 45]
  pendingOffsets.forEach((off, i) => {
    const f = pickForm(i)
    if (!f) return
    drafts.push({
      id: `seed-pending-${i + 1}`,
      formId: f.id,
      formNombre: GENERIC_NAME,
      data: i % 3 === 0 ? {} : buildPartial(f, (i % 2) + 1),
      createdAt: now - off * day,
      updatedAt: now - off * day,
    })
  })
  write(DRAFTS_KEY, drafts)

  const personas = [
    { nombre: 'Juan', apPat: 'Pérez', apMat: 'Rojas', email: 'juan.perez@empresa.cl', rut: '12.345.678-9', tel: '+56 9 1234 5678', razon: 'Comercial Pérez Ltda.', rutRazon: '76.123.456-7', ciudad: 'Santiago' },
    { nombre: 'María', apPat: 'González', apMat: 'Muñoz', email: 'maria.gonzalez@negocio.cl', rut: '13.456.789-0', tel: '+56 9 2345 6789', razon: 'Distribuidora MG SpA', rutRazon: '77.234.567-8', ciudad: 'Providencia' },
    { nombre: 'Carlos', apPat: 'Soto', apMat: 'Díaz', email: 'carlos.soto@comercio.cl', rut: '14.567.890-1', tel: '+56 9 3456 7890', razon: 'Soto y Compañía Ltda.', rutRazon: '78.345.678-9', ciudad: 'Las Condes' },
    { nombre: 'Ana', apPat: 'Muñoz', apMat: 'Silva', email: 'ana.munoz@tienda.cl', rut: '15.678.901-2', tel: '+56 9 4567 8901', razon: 'Tienda Ana EIRL', rutRazon: '79.456.789-0', ciudad: 'Ñuñoa' },
    { nombre: 'Pedro', apPat: 'Ramírez', apMat: 'Vega', email: 'pedro.ramirez@servicios.cl', rut: '16.789.012-3', tel: '+56 9 5678 9012', razon: 'Servicios PR SpA', rutRazon: '80.567.890-1', ciudad: 'Maipú' },
    { nombre: 'Lucía', apPat: 'Fernández', apMat: 'Torres', email: 'lucia.fernandez@boutique.cl', rut: '17.890.123-4', tel: '+56 9 6789 0123', razon: 'Boutique Lucía Ltda.', rutRazon: '81.678.901-2', ciudad: 'Vitacura' },
  ]

  const buildComplete = (f, p) => {
    const out = {}
    const fileNames = {
      fotoLocal: 'local-comercial.jpg',
      rrllAcreditacion: 'acreditacion-domicilio.pdf',
      fotoCarnetFrente: 'carnet-frente.jpg',
      fotoCarnetAtras: 'carnet-atras.jpg',
      eRutFrontal: 'e-rut-frontal.pdf',
      eRutTrasera: 'e-rut-trasera.pdf',
      carpetaTributaria: 'carpeta-tributaria.pdf',
    }
    for (const step of f.steps) {
      for (const fld of step.fields) {
        const n = fld.name.toLowerCase()
        if (fld.type === 'file') {
          out[fld.name] = { name: fileNames[fld.name] || `${fld.name}.pdf` }
          continue
        }
        if (fld.type === 'email') out[fld.name] = p.email
        else if (fld.type === 'tel') out[fld.name] = p.tel
        else if (fld.type === 'date') out[fld.name] = '1985-06-15'
        else if (fld.type === 'radio') out[fld.name] = fld.options?.[0] || 'Sí'
        else if (fld.type === 'select') {
          if (fld.dependsOn && fld.optionsByDependency === 'comunasPorRegion') {
            out[fld.name] = p.ciudad
          } else {
            out[fld.name] = fld.options?.[0] || ''
          }
        } else if (fld.type === 'textarea') {
          out[fld.name] = 'Comercio dedicado a la venta de productos y servicios al público general. Se utilizará la máquina para procesar pagos de clientes presenciales y a distancia.'
        } else if (fld.type === 'number') {
          out[fld.name] = '100'
        } else {
          if (n.includes('rut') && n.includes('razon')) out[fld.name] = p.rutRazon
          else if (n.includes('rut')) out[fld.name] = p.rut
          else if (n.includes('nombrerrll')) out[fld.name] = p.nombre
          else if (n.includes('nombrerazon')) out[fld.name] = p.razon
          else if (n === 'nombre') out[fld.name] = p.nombre
          else if (n.includes('apellidopaterno')) out[fld.name] = p.apPat
          else if (n.includes('apellidomaterno')) out[fld.name] = p.apMat
          else if (n === 'nacionalidad') out[fld.name] = 'Chilena'
          else if (n.includes('codigoactividad')) out[fld.name] = '479100'
          else if (n.includes('ejecutivo')) out[fld.name] = 'Andrés Torres Soto'
          else if (n.includes('terminal')) out[fld.name] = '1001234'
          else if (n.includes('numerocuenta')) out[fld.name] = '000123456789'
          else if (n.includes('calle') || n.includes('avenida') || n.includes('pasaje')) out[fld.name] = "Av. Libertador Bernardo O'Higgins"
          else if (n.includes('numero')) out[fld.name] = '1234'
          else if (n.includes('depto') || n.includes('oficina') || n.includes('local')) out[fld.name] = 'Oficina 501'
          else out[fld.name] = 'Dato ejemplo'
        }
      }
    }
    return out
  }

  const submitted = read(SUBMITTED_KEY).filter((d) => !String(d.id).startsWith('seed-'))
  const submittedOffsets = [2, 5, 9, 16, 24, 38]
  submittedOffsets.forEach((off, i) => {
    const f = pickForm(i)
    if (!f) return
    const createdAt = now - (off + 1) * day
    submitted.push({
      id: `seed-submitted-${i + 1}`,
      formId: f.id,
      formNombre: GENERIC_NAME,
      data: buildComplete(f, personas[i]),
      createdAt,
      updatedAt: now - off * day,
      submittedAt: now - off * day,
    })
  })
  write(SUBMITTED_KEY, submitted)

  localStorage.setItem(SEED_KEY, '1')
}

export function formatRelative(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'hace instantes'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d} d`
  return new Date(ts).toLocaleDateString('es-CL')
}

export function formatAbsolute(ts) {
  return new Date(ts).toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
