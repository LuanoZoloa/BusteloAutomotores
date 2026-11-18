/* ════════════════════════════════════════════════════════════════
   DATOS DE LA AGENCIA  ←  ÚNICO ARCHIVO QUE SE EDITA POR CLIENTE
   Todas las páginas leen de acá.
   ════════════════════════════════════════════════════════════════ */

const CONFIG = {
  nombre: 'Bustelo Automotores',
  monograma: 'BA',
  eslogan: 'Venta de usados y 0 km.',
  ciudad: 'Flores, CABA',
  direccion: 'Av. Lafuente 1233',
  whatsapp: '5491155125391',          // ⚠ CONFIRMAR: deducido del 11 5512-5391 del perfil (el wa.link no muestra el número)
  telefono: '11 5512-5391',           // en IG figura un segundo número (4637…) cortado
  instagram: '@busteloautomotores',
  email: 'ventas@agencia.com',         // ⚠ PENDIENTE: no figura en IG
  googleReviews: 'https://www.google.com/maps',
  timezone: 'America/Argentina/Buenos_Aires',

  // Imágenes de marca (ver img/README.md)
  logo: 'img/brand/logo.png',         // recortado del perfil de IG; reemplazar por el original en alta si lo consiguen
  heroImage: 'img/hero/hero.jpg',     // si no existe, el hero queda con fondo oscuro

  metricas: { years: 15, sold: 1200, rating: 4.9 },   // ⚠ PENDIENTE: valores de ejemplo

  horarios: [
    { label: 'Lunes a viernes', dias: [1, 2, 3, 4, 5], desde: '10:00', hasta: '19:00' },
    { label: 'Sábados',         dias: [6],             desde: '10:00', hasta: '16:00' },
    { label: 'Domingos',        dias: [0],             cerrado: true },
  ],

  // Simulador de financiación (valores de ejemplo: ajustar con la agencia)
  financiacion: {
    tna: 0.18,                         // tasa nominal anual (0.18 = 18 %)
    anticipoMin: 0.3,                  // 30 % mínimo
    cuotas: [12, 18, 24, 36, 48],
    aclaracion: 'Valores estimativos, sujetos a aprobación crediticia. No constituye oferta.',
  },

  historia: [
    'Empezamos vendiendo pocas unidades por año, elegidas una por una. Hoy el stock creció, pero el criterio es el mismo: si no lo compraríamos para nosotros, no lo vendemos.',
    'Cada auto pasa por revisión mecánica, verificación de papeles e historial antes de publicarse. Y cada operación la cierra alguien del equipo que te atiende de principio a fin.',
  ],

  faq: [
    { q: '¿Toman mi usado como parte de pago?', a: 'Sí, de todas las marcas. Te pasamos una tasación por fotos en el día y la confirmamos con una revisión presencial.' },
    { q: '¿Qué opciones de financiación tienen?', a: 'Trabajamos con créditos prendarios bancarios y financiación propia. Podés simular tu cuota en la sección Financiación.' },
    { q: '¿Las unidades tienen garantía?', a: 'Todas pasan revisión técnica. Consultanos la garantía de cada unidad en particular.' },
    { q: '¿Se encargan de la transferencia?', a: 'Sí, nuestra gestoría resuelve transferencia, informes y patentes para que solo tengas que firmar.' },
    { q: '¿Puedo reservar una unidad a distancia?', a: 'Sí. Te mandamos fotos y video extra, y podés reservar con una seña por transferencia.' },
  ],
};

/* ── STOCK ───────────────────────────────────────────────────────
   id:     código corto y único. También define la carpeta de fotos:
           id 'A01' → img/autos/a01/01.jpg, 02.jpg, 03.jpg …
   fotos:  cuántas fotos hay en esa carpeta (01.jpg es la portada).
   precio: null → muestra "Consultar".   km: null → no se muestra.
   galeria: ['https://…jpg', …] → fotos extra por link (se suman después de las locales).
   Cualquier dato en '' (vacío) simplemente no aparece en la web.
   moneda: 'USD' | 'ARS'
   estado: 'Disponible' | 'Reservado' | 'Vendido' (Vendido se oculta)

   ⚠ Cargado desde las historias de Instagram (nov 2026). Faltan
     precios, kilometrajes y algunos datos: completar con la agencia.
   ─────────────────────────────────────────────────────────────── */
const VEHICULOS = [
  { id: 'A08', marca: 'Ford', modelo: 'Territory', version: 'Titanium', anio: 2026, km: null, combustible: 'Nafta', transmision: 'Automática', tipo: 'SUV', motor: '', color: 'Negro', puertas: 5, precio: null, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 1,
    descripcion: '', equipamiento: [] },
  { id: 'A02', marca: 'Volkswagen', modelo: 'Amarok', version: 'V6 Extreme', anio: 2021, km: null, combustible: 'Diésel', transmision: 'Automática', tipo: 'Pickup', motor: 'V6 · 258 CV', color: 'Plata', puertas: 4, precio: null, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 1,
    descripcion: 'Único dueño. La V6 de 258 CV en su versión tope de gama.', equipamiento: [] },
  { id: 'A05', marca: 'Toyota', modelo: 'Corolla', version: 'XEI Pack CVT', anio: 2024, km: null, combustible: 'Nafta', transmision: 'Automática', tipo: 'Sedán', motor: '', color: 'Gris', puertas: 4, precio: null, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 3,
    descripcion: '', equipamiento: [] },
  { id: 'A07', marca: 'Mercedes-Benz', modelo: 'A250', version: 'AMG Line', anio: 2022, km: 24000, combustible: 'Nafta', transmision: 'Automática', tipo: 'Hatchback', motor: '', color: 'Plata', puertas: 5, precio: null, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 2,
    descripcion: 'Única mano, services oficiales.', equipamiento: [] },
  { id: 'A03', marca: 'Peugeot', modelo: '208', version: 'Allure Automático', anio: 2026, km: 0, combustible: 'Nafta', transmision: 'Automática', tipo: 'Hatchback', motor: '', color: '', puertas: 5, precio: null, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 3,
    descripcion: '0 km.', equipamiento: [] },
  { id: 'A06', marca: 'Hyundai', modelo: 'Tucson', version: '2.0 Nafta', anio: 2011, km: null, combustible: 'Nafta', transmision: 'Manual', tipo: 'SUV', motor: '2.0', color: 'Plata', puertas: 5, precio: null, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 3,
    descripcion: '', equipamiento: [] },
  { id: 'A01', marca: 'Fiat', modelo: 'Siena', version: '1.4 GNC', anio: 2016, km: null, combustible: 'Nafta/GNC', transmision: 'Manual', tipo: 'Sedán', motor: '1.4', color: 'Blanco', puertas: 4, precio: null, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 1,
    descripcion: 'Equipo de GNC de 5ta generación.', equipamiento: [] },
  { id: 'A04', marca: 'Ford', modelo: 'F100', version: '', anio: 1985, km: null, combustible: '', transmision: 'Manual', tipo: 'Pickup', motor: '', color: 'Rojo', puertas: 2, precio: null, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 3,
    descripcion: '', equipamiento: [] },
];

const TESTIMONIOS = [
  { nombre: 'Martín L.', lugar: 'Compró una Hilux', texto: 'Me mandaron videos de cada detalle antes de viajar. Llegué, firmé y me fui manejando. Cero sorpresas.' },
  { nombre: 'Carolina F.', lugar: 'Entregó su usado', texto: 'La tasación fue justa y me la pasaron el mismo día por WhatsApp. Todo por escrito, todo claro.' },
  { nombre: 'Santiago R.', lugar: 'Compró un Compass', texto: 'Atención directa con el dueño. Se nota que eligen bien lo que venden.' },
];
