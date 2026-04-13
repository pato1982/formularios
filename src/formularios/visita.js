// Formulario alternativo: solicitud de visita tecnica (mas corto, 2 pasos)

import { comunasPorRegion } from '../fields.js'

const regiones = Object.keys(comunasPorRegion)

const motivos = [
  'Instalación de equipo nuevo',
  'Cambio de equipo',
  'Falla técnica',
  'Capacitación',
  'Retiro de equipo',
  'Otro'
]

const horarios = [
  'Mañana (09:00 - 13:00)',
  'Tarde (14:00 - 18:00)',
  'Cualquier horario'
]

const urgencias = ['Baja', 'Media', 'Alta']

export const steps = [
  // ===== PASO 1 =====
  {
    id: 'paso1',
    title: 'Paso 1',
    subtitle: 'Datos del cliente',
    fields: [
      { name: 'nombre', label: 'Nombre del cliente', type: 'text', required: true, size: 'third', mobileHalf: true },
      { name: 'rut', label: 'RUT', type: 'text', required: true, size: 'third', mobileHalf: true, placeholder: '12.345.678-9' },
      { name: 'empresa', label: 'Empresa / Razón social', type: 'text', required: true, size: 'third', mobileFull: true },
      { name: 'telefono', label: 'Teléfono de contacto', type: 'tel', required: true, size: 'third' },
      { name: 'correo', label: 'Correo electrónico', type: 'email', required: true, size: 'third' },
      { name: 'nTerminal', label: 'N° terminal (si aplica)', type: 'text', required: false, size: 'third' },

      { name: 'region', label: 'Región', type: 'select', options: regiones, required: true, size: 'third' },
      { name: 'comuna', label: 'Comuna', type: 'select', options: [], required: true, size: 'third', dependsOn: 'region', optionsByDependency: 'comunasPorRegion' },
      { name: 'direccion', label: 'Dirección del local', type: 'text', required: true, size: 'third', mobileFull: true }
    ]
  },
  // ===== PASO 2 =====
  {
    id: 'paso2',
    title: 'Paso 2',
    subtitle: 'Detalle de la visita',
    fields: [
      { name: 'motivo', label: 'Motivo de la visita', type: 'select', options: motivos, required: true, size: 'third', mobileFull: true },
      { name: 'urgencia', label: 'Urgencia', type: 'select', options: urgencias, required: true, size: 'third', mobileFull: true },
      { name: 'horario', label: 'Horario preferido', type: 'select', options: horarios, required: true, size: 'third', mobileFull: true },

      { name: 'fecha', label: 'Fecha preferida', type: 'date', required: true, size: 'half', mobileFull: true },
      { name: 'alternativa', label: 'Fecha alternativa', type: 'date', required: false, size: 'half', mobileFull: true },

      { name: 'descripcion', label: 'Describe brevemente el problema o solicitud', type: 'textarea', required: true, size: 'full' },
      { name: 'fotoEquipo', label: 'Foto del equipo (si aplica)', type: 'file', required: false, size: 'half', mobileFull: true },
      { name: 'documentoExtra', label: 'Documento adicional (si aplica)', type: 'file', required: false, size: 'half', mobileFull: true }
    ]
  }
]
