/* ════════════════════════════════════════════════════════════════
   DATOS DE LA AGENCIA  ←  ÚNICO ARCHIVO QUE SE EDITA POR CLIENTE
   Todas las páginas leen de acá.
   ════════════════════════════════════════════════════════════════ */

const CONFIG = {
  nombre: 'Nombre Agencia',
  monograma: 'NA',
  eslogan: 'Vehículos seleccionados. Negocios bien cerrados.',
  ciudad: 'Ciudad, Provincia',
  direccion: 'Av. Siempre Viva 742',
  whatsapp: '5491100000000',          // formato internacional, sin + ni espacios
  telefono: '+54 9 11 0000-0000',     // como se muestra en pantalla
  instagram: '@agencia',
  email: 'ventas@agencia.com',
  googleReviews: 'https://www.google.com/maps',
  timezone: 'America/Argentina/Buenos_Aires',

  // Imágenes de marca (ver img/README.md)
  logo: '',                           // ej: 'img/brand/logo.svg' — si está vacío se usa el monograma
  heroImage: 'img/hero/hero.jpg',     // si no existe, el hero queda con fondo oscuro

  metricas: { years: 15, sold: 1200, rating: 4.9 },

  horarios: [
    { label: 'Lunes a viernes', dias: [1, 2, 3, 4, 5], desde: '09:00', hasta: '19:00' },
    { label: 'Sábados',         dias: [6],             desde: '09:30', hasta: '13:30' },
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
   precio: null → muestra "Consultar".
   moneda: 'USD' | 'ARS'
   estado: 'Disponible' | 'Reservado' | 'Vendido' (Vendido se oculta)
   ─────────────────────────────────────────────────────────────── */
const VEHICULOS = [
  { id: 'A01', marca: 'BMW', modelo: 'Serie 2 240i', version: 'M Sport Coupé', anio: 2021, km: 28000, combustible: 'Nafta', transmision: 'Automática', tipo: 'Coupé', motor: '3.0 turbo · 340 CV', color: 'Negro zafiro', puertas: 2, precio: 58500, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 5,
    descripcion: 'Único dueño, service oficial al día. Un coupé de seis cilindros con el balance justo entre uso diario y fin de semana.',
    equipamiento: ['Techo solar', 'Butacas deportivas', 'Harman Kardon', 'Head-up display', 'Cámara trasera', 'Control crucero adaptativo'] },
  { id: 'A02', marca: 'Jeep', modelo: 'Compass', version: 'Limited 1.3T', anio: 2022, km: 41000, combustible: 'Nafta', transmision: 'Automática', tipo: 'SUV', motor: '1.3 turbo · 175 CV', color: 'Gris granito', puertas: 5, precio: 33900, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 5,
    descripcion: 'SUV familiar con equipamiento completo y bajo kilometraje. Cubiertas nuevas.',
    equipamiento: ['Cuero', 'Cámara 360°', 'Apple CarPlay', 'Portón eléctrico', 'Climatizador bizona'] },
  { id: 'A03', marca: 'Toyota', modelo: 'Hilux', version: 'SRX 2.8 4x4', anio: 2023, km: 32000, combustible: 'Diésel', transmision: 'Automática', tipo: 'Pickup', motor: '2.8 turbodiésel · 204 CV', color: 'Blanco perla', puertas: 4, precio: 47000, moneda: 'USD', destacado: true, estado: 'Disponible', fotos: 5,
    descripcion: 'Tope de gama, uso particular, nunca hizo campo. Garantía de fábrica vigente.',
    equipamiento: ['4x4', 'Control crucero', 'Cuero', '7 airbags', 'Pantalla 8"'] },
  { id: 'A04', marca: 'Volkswagen', modelo: 'Amarok', version: 'V6 Extreme', anio: 2020, km: 78000, combustible: 'Diésel', transmision: 'Automática', tipo: 'Pickup', motor: '3.0 V6 TDI · 258 CV', color: 'Azul raven', puertas: 4, precio: 39500, moneda: 'USD', destacado: false, estado: 'Reservado', fotos: 4,
    descripcion: 'La V6 más buscada. Services en concesionario oficial.',
    equipamiento: ['V6 258 CV', 'Navegador', 'Llantas 20"', 'Butacas ergoComfort'] },
  { id: 'A05', marca: 'Audi', modelo: 'A3 Sedán', version: '1.4 TFSI', anio: 2019, km: 55000, combustible: 'Nafta', transmision: 'Automática', tipo: 'Sedán', motor: '1.4 TFSI · 150 CV', color: 'Plata', puertas: 4, precio: 27800, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 4,
    descripcion: 'Sedán premium compacto, impecable de interior.',
    equipamiento: ['Virtual cockpit', 'Xenón', 'Sensor de lluvia'] },
  { id: 'A06', marca: 'Mercedes-Benz', modelo: 'GLA 250', version: 'AMG Line', anio: 2021, km: 36000, combustible: 'Nafta', transmision: 'Automática', tipo: 'SUV', motor: '2.0 turbo · 224 CV', color: 'Blanco polar', puertas: 5, precio: null, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 4,
    descripcion: 'Paquete AMG Line completo. Consultá precio y condiciones.',
    equipamiento: ['MBUX', 'Techo panorámico', 'Iluminación ambiente'] },
  { id: 'A07', marca: 'Peugeot', modelo: '208', version: 'GT 1.6', anio: 2022, km: 24000, combustible: 'Nafta', transmision: 'Automática', tipo: 'Hatchback', motor: '1.6 · 115 CV', color: 'Rojo elixir', puertas: 5, precio: 21500, moneda: 'USD', destacado: false, estado: 'Disponible', fotos: 4,
    descripcion: 'Versión GT, ideal ciudad. Primer dueño.',
    equipamiento: ['i-Cockpit 3D', 'Cámara trasera', 'Full LED'] },
];

const TESTIMONIOS = [
  { nombre: 'Martín L.', lugar: 'Compró una Hilux', texto: 'Me mandaron videos de cada detalle antes de viajar. Llegué, firmé y me fui manejando. Cero sorpresas.' },
  { nombre: 'Carolina F.', lugar: 'Entregó su usado', texto: 'La tasación fue justa y me la pasaron el mismo día por WhatsApp. Todo por escrito, todo claro.' },
  { nombre: 'Santiago R.', lugar: 'Compró un Compass', texto: 'Atención directa con el dueño. Se nota que eligen bien lo que venden.' },
];
