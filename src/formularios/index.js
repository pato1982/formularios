import { steps, comunasPorRegion } from '../fields.js'

// Ambos formularios usan EXACTAMENTE los mismos campos y el mismo orden,
// pero se presentan al usuario en dos formatos distintos.

export const FORMULARIOS = [
  {
    id: 'wizard',
    nombre: 'Contratación paso a paso',
    descripcion: 'Formato guiado: avanza un paso a la vez. Ideal si prefieres completar el formulario de forma secuencial y no distraerte con el resto.',
    icono: '🧭',
    formato: 'Pasos',
    pasos: steps.length,
    layout: 'wizard',
    steps,
    deps: { comunasPorRegion }
  },
  {
    id: 'onepage',
    nombre: 'Contratación en una página',
    descripcion: 'Formato único: todas las secciones visibles en una sola página, desplegables tipo acordeón. Ideal si quieres tener el panorama completo desde el inicio.',
    icono: '📄',
    formato: 'Una página',
    pasos: steps.length,
    layout: 'onepage',
    steps,
    deps: { comunasPorRegion }
  }
]
