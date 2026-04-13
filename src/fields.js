// Esquema de campos: textos en minusculas salvo inicial de frase, siglas y nombres propios.

const tipoSociedad = [
  'Persona natural',
  'Sociedad por acciones (SpA)',
  'Sociedad anónima (S.A.)',
  'Sociedad de responsabilidad limitada (Ltda.)',
  'Empresa individual de responsabilidad limitada (EIRL)',
  'Sociedad colectiva',
  'Sociedad en comandita simple',
  'Sociedad en comandita por acciones',
  'Sociedad de hecho',
  'Sociedad de garantía recíproca (SGR)',
  'Cooperativa'
]

export const comunasPorRegion = {
  'Región Metropolitana de Santiago': ['Cerrillos','Cerro Navia','Conchalí','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Ñuñoa','Pedro Aguirre Cerda','Peñalolén','Providencia','Pudahuel','Quilicura','Quinta Normal','Recoleta','Renca','San Joaquín','San Miguel','San Ramón','Santiago','Vitacura','Puente Alto','Pirque','San José de Maipo','Colina','Lampa','Tiltil','San Bernardo','Buin','Calera de Tango','Paine','Melipilla','Alhué','Curacaví','María Pinto','San Pedro','Talagante','El Monte','Isla de Maipo','Padre Hurtado','Peñaflor'],
  'Región de Arica y Parinacota': ['Arica','Camarones','General Lagos','Putre'],
  'Región de Tarapacá': ['Iquique','Alto Hospicio','Pozo Almonte','Camiña','Colchane','Huara','Pica'],
  'Región de Antofagasta': ['Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','Tocopilla','María Elena'],
  'Región de Atacama': ['Copiapó','Caldera','Tierra Amarilla','Chañaral','Diego de Almagro','Vallenar','Alto del Carmen','Freirina','Huasco'],
  'Región de Coquimbo': ['La Serena','Coquimbo','Andacollo','La Higuera','Paihuano','Vicuña','Illapel','Canela','Los Vilos','Salamanca','Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado'],
  'Región de Valparaíso': ['Valparaíso','Casablanca','Concón','Juan Fernández','Puchuncaví','Quintero','Viña del Mar','Isla de Pascua','Los Andes','Calle Larga','Rinconada','San Esteban','La Ligua','Cabildo','Papudo','Petorca','Zapallar','Quillota','Calera','Hijuelas','La Cruz','Nogales','San Antonio','Algarrobo','Cartagena','El Quisco','El Tabo','Santo Domingo','San Felipe','Catemu','Llaillay','Panquehue','Putaendo','Santa María','Quilpué','Limache','Olmué','Villa Alemana'],
  "Región del Libertador General Bernardo O'Higgins": ['Rancagua','Codegua','Coinco','Coltauco','Doñihue','Graneros','Las Cabras','Machalí','Malloa','Mostazal','Olivar','Peumo','Pichidegua','Quinta de Tilcoco','Rengo','Requínoa','San Vicente','Pichilemu','La Estrella','Litueche','Marchihue','Navidad','Paredones','San Fernando','Chépica','Chimbarongo','Lolol','Nancagua','Palmilla','Peralillo','Placilla','Pumanque','Santa Cruz'],
  'Región del Maule': ['Talca','Constitución','Curepto','Empedrado','Maule','Pelarco','Pencahue','Río Claro','San Clemente','San Rafael','Cauquenes','Chanco','Pelluhue','Curicó','Hualañé','Licantén','Molina','Rauco','Romeral','Sagrada Familia','Teno','Vichuquén','Linares','Colbún','Longaví','Parral','Retiro','San Javier','Villa Alegre','Yerbas Buenas'],
  'Región de Ñuble': ['Chillán','Bulnes','Chillán Viejo','El Carmen','Pemuco','Pinto','Quillón','San Ignacio','Yungay','Quirihue','Cobquecura','Coelemu','Ninhue','Portezuelo','Ránquil','Treguaco','San Carlos','Coihueco','Ñiquén','San Fabián','San Nicolás'],
  'Región del Biobío': ['Concepción','Coronel','Chiguayante','Florida','Hualpén','Hualqui','Lota','Penco','San Pedro de la Paz','Santa Juana','Talcahuano','Tomé','Lebu','Arauco','Cañete','Contulmo','Curanilahue','Los Álamos','Tirúa','Los Ángeles','Antuco','Cabrero','Laja','Mulchén','Nacimiento','Negrete','Quilaco','Quilleco','San Rosendo','Santa Bárbara','Tucapel','Yumbel','Alto Biobío'],
  'Región de La Araucanía': ['Temuco','Carahue','Cholchol','Cunco','Curarrehue','Freire','Galvarino','Gorbea','Lautaro','Loncoche','Melipeuco','Nueva Imperial','Padre Las Casas','Perquenco','Pitrufquén','Pucón','Saavedra','Teodoro Schmidt','Toltén','Vilcún','Villarrica','Angol','Collipulli','Curacautín','Ercilla','Lonquimay','Los Sauces','Lumaco','Purén','Renaico','Traiguén','Victoria'],
  'Región de Los Ríos': ['Valdivia','Corral','Lanco','Los Lagos','Máfil','Mariquina','Paillaco','Panguipulli','La Unión','Futrono','Lago Ranco','Río Bueno'],
  'Región de Los Lagos': ['Puerto Montt','Calbuco','Cochamó','Fresia','Frutillar','Los Muermos','Llanquihue','Maullín','Puerto Varas','Castro','Ancud','Chonchi','Curaco de Vélez','Dalcahue','Puqueldón','Queilén','Quellón','Quemchi','Quinchao','Osorno','Puerto Octay','Purranque','Puyehue','Río Negro','San Juan de la Costa','San Pablo','Chaitén','Futaleufú','Hualaihué','Palena'],
  'Región de Aysén': ['Coyhaique','Lago Verde','Aysén','Cisnes','Guaitecas','Cochrane','O\'Higgins','Tortel','Chile Chico','Río Ibáñez'],
  'Región de Magallanes y de la Antártica Chilena': ['Punta Arenas','Laguna Blanca','Río Verde','San Gregorio','Cabo de Hornos','Antártica','Porvenir','Primavera','Timaukel','Natales','Torres del Paine']
}

const regiones = [
  'Región Metropolitana de Santiago',
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  "Región del Libertador General Bernardo O'Higgins",
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes y de la Antártica Chilena'
]

const bancos = [
  'Santander',
  'Asignar cuenta comercio Banco Santander',
  'Banco de Chile',
  'BancoEstado',
  'Banco BCI',
  'Banco Itaú Chile',
  'Banco BICE',
  'Scotiabank Chile',
  'Banco Security',
  'Banco Falabella',
  'Banco Coopeuch',
  'Banco Ripley',
  'Banco Internacional',
  'Banco Corpbanca',
  'Banco Condell',
  'Banco Consorcio',
  'Banco BTG Pactual Chile'
]

const tiposCuenta = [
  'Cuenta corriente',
  'Cuenta corriente empresa',
  'Cuenta vista',
  'Cuenta vista empresa',
  'Cuenta Life',
  'Cuenta Más Lucas',
  'Cuenta RUT',
  'Cuenta corriente Life PYME'
]

const tipoEnvio = [
  'Con técnico',
  'Entrega inmediata',
  'Entrega inmediata - meses gratis',
  'Delivery Seven RM periferia (costo $5.000)',
  'Delivery Seven regiones (costo $10.000)'
]

export const steps = [
  // ===== PASO 1 =====
  {
    id: 'paso1',
    title: 'Paso 1',
    subtitle: 'Datos personales y de razón social',
    fields: [
      { name: 'correo', label: 'Correo', type: 'email', required: true, help: 'Correo válido (registra cuenta Google)', size: 'third', mobileHalf: true },
      { name: 'rutRRLL', label: 'RUT representante legal', type: 'text', required: true, size: 'third', mobileHalf: true, placeholder: '12.345.678-9' },
      { name: 'nombreRRLL', label: 'Nombre del RRLL', type: 'text', required: true, size: 'third', mobileFull: true },
      { name: 'apellidoPaterno', label: 'Apellido paterno', type: 'text', required: true, size: 'third' },
      { name: 'apellidoMaterno', label: 'Apellido materno', type: 'text', required: true, size: 'third' },
      { name: 'rutRazonSocial', label: 'RUT razón social', type: 'text', required: true, size: 'third' },
      { name: 'nombreRazonSocial', label: 'Nombre razón social', type: 'text', required: true, size: 'third' },
      { name: 'nacionalidad', label: 'Nacionalidad', type: 'text', required: true, size: 'third' },
      { name: 'fechaNacimiento', label: 'Fecha de nacimiento (DD/MM/AAAA)', type: 'date', required: false, size: 'third' }
    ]
  },

  // ===== PASO 2 =====
  {
    id: 'paso2',
    title: 'Paso 2',
    subtitle: 'Datos comerciales y operacionales',
    fields: [
      { name: 'tipoSociedad', label: 'Tipo sociedad', type: 'select', options: tipoSociedad, required: true, size: 'third', mobileFull: true },
      { name: 'codigoActividad', label: 'Código de actividad comercial (SII)', type: 'text', required: true, size: 'third', mobileFull: true },
      { name: 'fotoLocal', label: 'Fotografía de local', type: 'file', required: true, size: 'third', mobileFull: true },
      { name: 'dedicacion', label: 'Escribir brevemente a qué se dedica y para qué utilizará la máquina', type: 'textarea', required: true, size: 'full' },
      { name: 'numeroTelefono', label: 'Número teléfono', type: 'tel', required: true, size: 'half' },
      { name: 'correoComercial', label: 'Correo electrónico', type: 'email', required: true, size: 'half' },

      { name: 'rrllCalle', label: 'RRLL calle / avenida / pasaje', type: 'text', required: true, size: 'third', mobileFull: true, group: 'Domicilio representante legal' },
      { name: 'rrllNumero', label: 'RRLL número de calle / avenida / pasaje', type: 'text', required: true, size: 'third' },
      { name: 'rrllDepto', label: 'RRLL número depto / oficina / local', type: 'text', required: false, size: 'third' },

      { name: 'localCalle', label: 'Local calle / avenida / pasaje', type: 'text', required: true, size: 'third', mobileFull: true, group: 'Dirección local comercial' },
      { name: 'localNumero', label: 'Local número de calle / avenida / pasaje', type: 'text', required: true, size: 'third' },
      { name: 'localDepto', label: 'Local número depto / oficina / local', type: 'text', required: false, size: 'third' },

      { name: 'rrllAcreditacion', label: 'RRLL acreditación domicilio', type: 'file', required: true, size: 'full', group: 'Ubicación y operación' },
      { name: 'region', label: 'Región', type: 'select', options: regiones, required: true, size: 'third' },
      { name: 'comuna', label: 'Comuna', type: 'select', options: [], required: true, size: 'third', dependsOn: 'region', optionsByDependency: 'comunasPorRegion' },
      { name: 'depositosDia', label: 'Cuántos depósitos al día (1 o 5)', type: 'select', options: ['1', '5', 'No aplica'], required: true, size: 'third' },
      { name: 'tipoEnvio', label: 'Tipo de envío de equipo', type: 'select', options: tipoEnvio, required: true, size: 'third' },
      { name: 'terminal1', label: 'Número terminal 1', type: 'text', required: false, size: 'third' },
      { name: 'terminal2', label: 'Número terminal 2', type: 'text', required: false, size: 'third' },
      { name: 'propinaPOS', label: 'Propina en POS', type: 'radio', options: ['Sí', 'No'], required: true, size: 'third' },
      { name: 'getservicios', label: '¿Quiere GetServicios?', type: 'radio', options: ['Sí', 'No'], required: true, size: 'third' },
      { name: 'nombreEjecutivo', label: 'Nombre ejecutivo (1er nombre + apellidos)', type: 'text', required: false, size: 'third', mobileFull: true }
    ]
  },

  // ===== PASO 3 =====
  {
    id: 'paso3',
    title: 'Paso 3',
    subtitle: 'Depósito en banco',
    fields: [
      { name: 'banco', label: 'Banco para depósito', type: 'select', options: bancos, required: true, size: 'half' },
      { name: 'tipoCuenta', label: 'Tipo cuenta', type: 'select', options: tiposCuenta, required: true, size: 'half' },
      { name: 'numeroCuenta', label: 'Número cuenta (en caso de cualquier otra cuenta que no sea cta comercio indicar)', type: 'text', required: false, size: 'full' }
    ]
  },

  // ===== PASO 4 =====
  {
    id: 'paso4',
    title: 'Paso 4',
    subtitle: 'Documentos adjuntos',
    fields: [
      { name: 'fotoCarnetFrente', label: 'Foto carnet representante legal (frente)', type: 'file', required: true, size: 'half'},
      { name: 'fotoCarnetAtras', label: 'Foto carnet representante legal (atrás)', type: 'file', required: true, size: 'half'},
      { name: 'eRutFrontal', label: 'E-RUT (frontal)', type: 'file', required: false, size: 'half'},
      { name: 'eRutTrasera', label: 'E-RUT (trasera)', type: 'file', required: false, size: 'half'},
      { name: 'carpetaTributaria', label: 'Carpeta tributaria', type: 'file', required: false, size: 'half'},
      { name: 'historialDAI1', label: 'Historial DAI 1', type: 'file', required: false, size: 'half'},
      { name: 'historialDAI2', label: 'Historial DAI 2', type: 'file', required: false, size: 'half'},
      { name: 'escrituraPublica', label: 'Escritura pública', type: 'file', required: false, size: 'half'},
      { name: 'publicacionDiario', label: 'Publicación Diario Oficial', type: 'file', required: false, size: 'half'},
      { name: 'inscripcionCBR', label: 'Inscripción escritura CBR', type: 'file', required: false, size: 'half'},
      { name: 'extractoSociedad', label: 'Extracto de sociedad', type: 'file', required: false, size: 'half'},
      { name: 'selfie', label: 'Selfie con cédula de identidad', type: 'file', required: true, size: 'half'},
      { name: 'formularioContratacion', label: 'Formulario de contratación', type: 'file', required: true, size: 'half'},
      { name: 'firmaRecepcionPOS', label: 'Firma recepción de POS cliente', type: 'file', required: false, size: 'half'}
    ]
  }
]
