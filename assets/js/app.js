/* ════════════════════════════════════════════════════════════════
   APP — lógica compartida + módulos por página
   Cada página declara <body data-page="home|stock|vehiculo|usado|financiacion|agencia">
   y este archivo monta header, footer y lo específico de esa página.
   ════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     01 · HELPERS
     ────────────────────────────────────────────────────────────── */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PAGE = document.body.dataset.page;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtNum = n => new Intl.NumberFormat('es-AR').format(Math.round(n));
  const money = (n, moneda = 'USD') => `${moneda === 'USD' ? 'US$' : '$'} ${fmtNum(n)}`;
  const fmtPrice = v => v.precio == null ? 'Consultar' : money(v.precio, v.moneda);
  const title = v => `${v.marca} ${v.modelo}`;
  const waUrl = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const vUrl = v => `vehiculo.html?id=${encodeURIComponent(v.id)}`;
  const stock = () => VEHICULOS.filter(v => v.estado !== 'Vendido');
  const uniq = (list, k) => [...new Set(list.map(v => v[k]))].sort((a, b) => String(a).localeCompare(b, 'es'));

  // Fotos por convención: img/autos/{id}/01.jpg, 02.jpg …
  const fotoUrl = (v, n = 1) => `img/autos/${v.id.toLowerCase()}/${String(n).padStart(2, '0')}.jpg`;
  const fotosDe = v => Array.from({ length: Math.max(v.fotos || 1, 1) }, (_, i) => fotoUrl(v, i + 1));

  // Mensajes de WhatsApp prellenados por intención
  const MSG = {
    general:      () => `Hola ${CONFIG.nombre}, vengo de la web y quiero recibir asesoramiento.`,
    usado:        () => `Hola ${CONFIG.nombre}, quiero cotizar mi usado.`,
    financiacion: () => `Hola ${CONFIG.nombre}, quiero consultar opciones de financiación.`,
    visita:       () => `Hola ${CONFIG.nombre}, quiero agendar una visita a la agencia. ¿Qué día tienen disponible?`,
    busqueda:     () => `Hola ${CONFIG.nombre}, estoy buscando un vehículo que no vi en la web: `,
    vehiculo:     v  => `Hola ${CONFIG.nombre}, vi este ${title(v)} ${v.version} ${v.anio} en la web (${fmtPrice(v)} · Ref. ${v.id}) y quiero consultar disponibilidad.`,
    vehiculoVisita: v => `Hola ${CONFIG.nombre}, quiero coordinar para ver el ${title(v)} ${v.anio} (Ref. ${v.id}). ¿Cuándo puedo pasar?`,
  };

  // Horarios y estado "abierto ahora" en la zona horaria de la agencia
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  function openState() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: CONFIG.timezone }));
    const today = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    const slot = CONFIG.horarios.find(h => h.dias.includes(today) && !h.cerrado);
    return { today, slot, open: !!slot && mins >= toMin(slot.desde) && mins < toMin(slot.hasta) };
  }
  const openBadge = () => {
    const { open, slot } = openState();
    return open
      ? `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span><span class="relative h-2 w-2 rounded-full bg-emerald-400"></span></span><span>Abierto ahora · hasta las ${slot.hasta}</span>`
      : `<span class="h-2 w-2 rounded-full bg-mute"></span><span>Cerrado ahora · respondemos tu WhatsApp al abrir</span>`;
  };
  const hoursHTML = () => {
    const { today } = openState();
    return CONFIG.horarios.map(h => {
      const isToday = h.dias.includes(today);
      return `<div class="flex justify-between gap-6 py-3 ${isToday ? 'text-bone' : 'text-mute'}">
        <span>${esc(h.label)}${isToday ? ' <span class="ml-2 text-[10px] uppercase tracking-wider text-accent">Hoy</span>' : ''}</span>
        <span>${h.cerrado ? 'Cerrado' : `${h.desde} – ${h.hasta}`}</span></div>`;
    }).join('');
  };
  const mapQuery = () => encodeURIComponent(`${CONFIG.direccion}, ${CONFIG.ciudad}`);

  /* ──────────────────────────────────────────────────────────────
     02 · COMPONENTES
     ────────────────────────────────────────────────────────────── */
  // Imagen con placeholder elegante (si la foto falta, queda la marca de fondo)
  const media = (src, alt, label, cls = '') => `
    <div class="media relative overflow-hidden bg-smoke ${cls}">
      <div class="absolute inset-0 grid place-items-center bg-[radial-gradient(80%_80%_at_70%_20%,#222,#111)]">
        <span class="px-4 text-center font-display text-5xl  text-white/10 md:text-6xl">${esc(label)}</span>
      </div>
      <img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover text-transparent" onerror="this.classList.add('is-broken')" />
    </div>`;

  const badge = txt => `<span class="rounded-full border border-white/10 px-3 py-1 text-[11px] text-bone/80">${esc(txt)}</span>`;

  const logoHTML = (size = 'h-9 w-9') => CONFIG.logo
    ? `<img src="${esc(CONFIG.logo)}" alt="${esc(CONFIG.nombre)}" class="${size} rounded-full object-cover ring-1 ring-white/10" />`
    : `<span class="grid ${size} place-items-center rounded-full border border-white/15 font-display text-lg  text-bone">${esc(CONFIG.monograma)}</span>`;

  // Patrón asimétrico de 12 columnas: 7+5 / 5+7 / 4+4+4
  const PATTERN = [
    { span: 'lg:col-span-7', h: 'lg:h-[420px]', big: true },
    { span: 'lg:col-span-5', h: 'lg:h-[420px]' },
    { span: 'lg:col-span-5', h: 'lg:h-[420px]' },
    { span: 'lg:col-span-7', h: 'lg:h-[420px]', big: true },
    { span: 'lg:col-span-4', h: 'lg:h-[300px]' },
    { span: 'lg:col-span-4', h: 'lg:h-[300px]' },
    { span: 'lg:col-span-4', h: 'lg:h-[300px]' },
  ];

  function card(v, i = 0, pattern = PATTERN) {
    const p = pattern[i % pattern.length];
    return `
    <article class="card reveal group flex flex-col overflow-hidden rounded-3xl border border-white/[.06] bg-coal transition-colors duration-500 hover:border-white/15 ${p.span}" data-card="${esc(v.id)}">
      <button type="button" data-expand="${esc(v.id)}" class="relative block w-full text-left" aria-label="Más información de ${esc(title(v))}">
        ${media(fotoUrl(v), `${title(v)} ${v.anio}`, v.marca, `h-[260px] ${p.h}`)}
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        <div class="absolute left-4 top-4 flex gap-2">
          ${v.destacado ? '<span class="rounded-full bg-bone px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">Destacado</span>' : ''}
          ${v.estado === 'Reservado' ? '<span class="rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-wider text-accent backdrop-blur">Reservado</span>' : ''}
        </div>
        <span class="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] tracking-wider text-white/70 backdrop-blur">REF ${esc(v.id)}</span>
      </button>
      <div class="flex flex-1 flex-col p-6 md:p-7">
        <p class="text-[11px] tracking-eyebrow text-mute">${v.anio}</p>
        <button type="button" data-expand="${esc(v.id)}" class="mt-2 text-left">
          <h3 class="font-display ${p.big ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'} leading-[1.02] transition hover:text-accent">${esc(title(v))}</h3>
        </button>
        <p class="mt-2 text-sm text-mute">${esc(v.version)}</p>
        <div class="mt-5 flex flex-wrap gap-2">${badge(`${fmtNum(v.km)} km`)}${badge(v.combustible)}${badge(v.transmision)}${badge(v.tipo)}</div>
        <div class="mt-auto flex items-center justify-between gap-4 pt-7">
          <p class="font-display text-3xl ${v.precio == null ? 'text-bone/70' : ''}">${fmtPrice(v)}</p>
          <button type="button" data-expand="${esc(v.id)}" class="inline-flex shrink-0 items-center rounded-full bg-bone px-5 py-3 text-[13px] font-medium text-ink transition hover:bg-accent">Más info</button>
        </div>
      </div>
    </article>`;
  }

  const specRow = (k, val) => val == null || val === '' ? '' : `<div class="flex justify-between gap-6 border-b border-white/[.06] py-3.5 text-sm"><dt class="text-mute">${k}</dt><dd class="text-right">${esc(val)}</dd></div>`;
  const specList = v => specRow('Año', v.anio) + specRow('Kilometraje', `${fmtNum(v.km)} km`) + specRow('Motor', v.motor) + specRow('Combustible', v.combustible) + specRow('Transmisión', v.transmision) + specRow('Carrocería', v.tipo) + specRow('Puertas', v.puertas) + specRow('Color', v.color);

  /* ──────────────────────────────────────────────────────────────
     02b · VISTA EXPANDIDA
     La tarjeta crece desde su posición hasta ocupar casi toda la
     pantalla (animación FLIP) y muestra todas las fotos + la ficha.
     Se cierra con ✕, Esc, clic afuera o el botón "atrás" del celular.
     ────────────────────────────────────────────────────────────── */
  const Expand = (() => {
    let layer, panel, current, sourceCard, closing = false;
    const EASE = 'cubic-bezier(.2,.7,.2,1)', DUR = reduceMotion ? 0 : 600;

    const rectOf = el => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height }; };
    const target = () => {
      const m = innerWidth < 768 ? 0 : Math.max(innerWidth * 0.025, 16);
      const w = Math.min(innerWidth - m * 2, 1480);
      return { top: innerWidth < 768 ? 0 : innerHeight * 0.025, left: (innerWidth - w) / 2, width: w, height: innerWidth < 768 ? innerHeight : innerHeight * 0.95 };
    };
    const place = (r, radius) => Object.assign(panel.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: radius });

    function content(v) {
      const fotos = fotosDe(v);
      return `
      <div class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[.06] bg-coal/90 px-5 py-4 backdrop-blur-xl md:px-8">
        <div class="min-w-0">
          <p class="text-[11px] tracking-eyebrow text-mute">${v.anio} · REF ${esc(v.id)}</p>
          <p class="truncate font-display text-xl md:text-2xl">${esc(title(v))}</p>
        </div>
        <button type="button" data-close class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 text-mute transition hover:border-white/30 hover:text-bone" aria-label="Cerrar">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
        </button>
      </div>

      <div class="grid gap-8 p-5 md:p-8 lg:grid-cols-12 lg:gap-10">
        <!-- Fotos: carrusel con snap en mobile, grilla editorial en desktop -->
        <div class="min-w-0 lg:col-span-8">
          <div class="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:px-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible">
            ${fotos.map((f, i) => `
              <figure class="w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/[.06] md:w-[70%] lg:w-auto ${i === 0 ? 'lg:col-span-2' : ''}">
                ${media(f, `${title(v)} — foto ${i + 1}`, String(i + 1).padStart(2, '0'), i === 0 ? 'aspect-[4/3] lg:aspect-[16/9]' : 'aspect-[4/3]')}
              </figure>`).join('')}
          </div>
          <p class="mt-3 text-xs text-mute lg:hidden">${fotos.length} fotos · deslizá para ver más</p>
        </div>

        <!-- Información -->
        <aside class="lg:col-span-4">
          <div class="lg:sticky lg:top-24">
            <p class="text-[11px] tracking-eyebrow text-mute">${v.anio}</p>
            <h2 class="mt-2 font-display text-4xl leading-[1.02] md:text-5xl">${esc(title(v))}</h2>
            <p class="mt-2 text-mute">${esc(v.version)}</p>
            <p class="mt-6 font-display text-5xl ${v.precio == null ? 'text-bone/70' : ''}">${fmtPrice(v)}</p>
            ${v.estado === 'Reservado' ? '<p class="mt-3 inline-flex rounded-full border border-accent/40 px-3 py-1 text-xs text-accent">Reservado</p>' : ''}

            <div class="mt-8 flex flex-col gap-3">
              <a href="${waUrl(MSG.vehiculo(v))}" target="_blank" rel="noopener" class="rounded-full bg-bone px-6 py-4 text-center text-sm font-medium text-ink transition hover:bg-accent">Consultar por WhatsApp</a>
              <a href="${waUrl(MSG.vehiculoVisita(v))}" target="_blank" rel="noopener" class="rounded-full border border-white/15 px-6 py-4 text-center text-sm transition hover:border-white/40">Coordinar una visita</a>
            </div>

            <dl class="mt-10">${specList(v)}</dl>

            ${v.equipamiento?.length ? `
            <p class="mt-10 text-[11px] uppercase tracking-eyebrow text-mute">Equipamiento</p>
            <div class="mt-4 flex flex-wrap gap-2">${v.equipamiento.map(badge).join('')}</div>` : ''}

            ${v.descripcion ? `<p class="mt-10 text-[15px] leading-relaxed text-bone/80">${esc(v.descripcion)}</p>` : ''}

            <div class="mt-10 grid grid-cols-2 gap-3 text-sm">
              ${v.precio != null ? `<a href="financiacion.html?id=${encodeURIComponent(v.id)}" class="rounded-2xl border border-white/[.06] p-4 transition hover:border-white/20"><span class="block text-mute">Financiación</span><span class="mt-1 block">Simular cuota</span></a>` : ''}
              <a href="usado.html?id=${encodeURIComponent(v.id)}" class="rounded-2xl border border-white/[.06] p-4 transition hover:border-white/20 ${v.precio == null ? 'col-span-2' : ''}"><span class="block text-mute">Tu usado</span><span class="mt-1 block">Parte de pago</span></a>
            </div>
            <a href="${vUrl(v)}" class="mt-6 inline-flex text-sm text-mute underline-offset-4 hover:text-bone hover:underline">Abrir ficha para compartir</a>
          </div>
        </aside>
      </div>`;
    }

    function build() {
      layer = document.createElement('div');
      layer.className = 'fixed inset-0 z-[70]';
      Object.assign(layer.style, { background: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', transition: `background ${DUR}ms ease, backdrop-filter ${DUR}ms ease` });
      layer.innerHTML = `<div class="expand-panel fixed overflow-hidden border border-white/10 bg-coal shadow-2xl" role="dialog" aria-modal="true">
        <div class="expand-scroll h-full overflow-y-auto overscroll-contain opacity-0"></div></div>`;
      panel = layer.firstElementChild;
      layer.addEventListener('click', e => { if (e.target === layer || e.target.closest('[data-close]')) close(); });
      document.body.appendChild(layer);
    }

    function open(id) {
      const v = VEHICULOS.find(x => x.id === id); if (!v || current) return;
      sourceCard = document.querySelector(`[data-card="${CSS.escape(id)}"]`);
      current = v; build();
      const scroll = panel.firstElementChild;
      scroll.innerHTML = content(v);
      const from = sourceCard ? rectOf(sourceCard) : target();
      place(from, '24px');
      document.documentElement.style.overflow = 'hidden';
      if (sourceCard) sourceCard.style.visibility = 'hidden';
      history.pushState({ expand: id }, '');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.style.transition = `top ${DUR}ms ${EASE}, left ${DUR}ms ${EASE}, width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, border-radius ${DUR}ms ${EASE}`;
        place(target(), innerWidth < 768 ? '0px' : '28px');
        Object.assign(layer.style, { background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(10px)' });
        scroll.style.transition = `opacity ${DUR * 0.6}ms ease ${DUR * 0.4}ms`;
        scroll.style.opacity = 1;
      }));
      setTimeout(() => panel.querySelector('[data-close]')?.focus({ preventScroll: true }), DUR);
    }

    // close() pasa por el historial para que el "atrás" del celular también cierre
    function close() { if (current && !closing) history.back(); }

    function animateClose() {
      if (!current || closing) return;
      closing = true;
      const scroll = panel.firstElementChild;
      scroll.style.transition = `opacity ${DUR * 0.3}ms ease`;
      scroll.style.opacity = 0;
      Object.assign(layer.style, { background: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' });
      const visible = sourceCard && sourceCard.getClientRects().length;
      if (visible) place(rectOf(sourceCard), '24px'); else panel.style.opacity = 0;
      setTimeout(() => {
        if (sourceCard) sourceCard.style.visibility = '';
        layer.remove(); document.documentElement.style.overflow = '';
        current = sourceCard = null; closing = false;
      }, DUR);
    }

    addEventListener('popstate', animateClose);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    addEventListener('resize', () => { if (current && !closing) { panel.style.transition = 'none'; place(target(), innerWidth < 768 ? '0px' : '28px'); } });
    document.addEventListener('click', e => { const b = e.target.closest('[data-expand]'); if (b) open(b.dataset.expand); });
    return { open, close };
  })();

  const testimonialHTML = t => `
    <figure class="reveal flex flex-col justify-between rounded-3xl border border-white/[.06] bg-coal p-8">
      <blockquote class="font-display text-2xl leading-snug">“${esc(t.texto)}”</blockquote>
      <figcaption class="mt-10 flex items-center gap-3 text-sm">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-smoke font-display  text-accent">${esc(t.nombre[0])}</span>
        <span><span class="block">${esc(t.nombre)}</span><span class="text-xs text-mute">${esc(t.lugar)}</span></span>
      </figcaption>
    </figure>`;

  /* ──────────────────────────────────────────────────────────────
     03 · LAYOUT (header + footer compartidos)
     ────────────────────────────────────────────────────────────── */
  const NAV = [
    { key: 'stock', href: 'stock.html', label: 'Stock' },
    { key: 'usado', href: 'usado.html', label: 'Tu usado' },
    { key: 'financiacion', href: 'financiacion.html', label: 'Financiación' },
    { key: 'agencia', href: 'agencia.html', label: 'La agencia' },
  ];
  const activeKey = PAGE === 'vehiculo' ? 'stock' : PAGE;

  function renderHeader() {
    const el = $('#site-header'); if (!el) return;
    el.outerHTML = `
    <header id="siteHeader" class="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div class="header-shell mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/[.06] bg-ink/30 px-5 py-3 backdrop-blur-xl transition-colors duration-500">
        <a href="index.html" class="flex items-center gap-3" aria-label="Inicio">
          ${logoHTML()}<span class="text-sm font-medium tracking-wide">${esc(CONFIG.nombre)}</span>
        </a>
        <nav class="hidden items-center gap-8 text-[13px] text-mute md:flex" aria-label="Principal">
          ${NAV.map(n => `<a href="${n.href}" class="nav-link transition hover:text-bone" ${n.key === activeKey ? 'aria-current="page"' : ''}>${n.label}</a>`).join('')}
        </nav>
        <div class="flex items-center gap-2">
          <a href="${waUrl(MSG.general())}" target="_blank" rel="noopener" class="hidden rounded-full bg-bone px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-accent sm:inline-flex">Hablar ahora</a>
          <button id="menuBtn" class="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 5h12M2 11h12"/></svg>
          </button>
        </div>
      </div>
      <div id="mobileMenu" class="mx-auto mt-2 hidden max-w-6xl rounded-3xl border border-white/10 bg-ink/95 p-6 backdrop-blur-xl md:hidden">
        <nav class="flex flex-col gap-4 font-display text-3xl">
          <a href="index.html" class="${PAGE === 'home' ? 'text-accent' : ''}">Inicio</a>
          ${NAV.map(n => `<a href="${n.href}" class="${n.key === activeKey ? 'text-accent' : ''}">${n.label}</a>`).join('')}
        </nav>
        <a href="${waUrl(MSG.general())}" target="_blank" rel="noopener" class="mt-6 flex justify-center rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink">Escribinos por WhatsApp</a>
      </div>
    </header>`;

    const header = $('#siteHeader'), btn = $('#menuBtn'), menu = $('#mobileMenu');
    btn.addEventListener('click', () => btn.setAttribute('aria-expanded', !menu.classList.toggle('hidden')));
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  function renderFooter() {
    const el = $('#site-footer'); if (!el) return;
    const ig = CONFIG.instagram.replace('@', '');
    el.outerHTML = `
    <footer class="border-t border-white/[.06]">
      <div class="mx-auto grid max-w-7xl gap-12 px-5 py-16 text-sm md:grid-cols-2 md:px-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <div class="flex items-center gap-3">${logoHTML()}<span class="font-medium">${esc(CONFIG.nombre)}</span></div>
          <p class="mt-5 max-w-xs font-display text-2xl  leading-snug text-bone/70">${esc(CONFIG.eslogan)}</p>
        </div>
        <div class="lg:col-span-2">
          <p class="text-[11px] uppercase tracking-eyebrow text-mute">Navegación</p>
          <ul class="mt-5 space-y-3">
            <li><a href="index.html" class="hover:text-accent">Inicio</a></li>
            ${NAV.map(n => `<li><a href="${n.href}" class="hover:text-accent">${n.label}</a></li>`).join('')}
          </ul>
        </div>
        <div class="lg:col-span-3">
          <p class="text-[11px] uppercase tracking-eyebrow text-mute">Contacto</p>
          <ul class="mt-5 space-y-3">
            <li><a href="${waUrl(MSG.general())}" target="_blank" rel="noopener" class="hover:text-accent">${esc(CONFIG.telefono)}</a></li>
            <li><a href="https://instagram.com/${esc(ig)}" target="_blank" rel="noopener" class="hover:text-accent">${esc(CONFIG.instagram)}</a></li>
            <li><a href="mailto:${esc(CONFIG.email)}" class="hover:text-accent">${esc(CONFIG.email)}</a></li>
            <li class="text-mute">${esc(CONFIG.direccion)}, ${esc(CONFIG.ciudad)}</li>
          </ul>
        </div>
        <div class="lg:col-span-3">
          <p class="text-[11px] uppercase tracking-eyebrow text-mute">Horarios</p>
          <div class="mt-3 divide-y divide-white/[.06] text-[13px]">${hoursHTML()}</div>
          <div class="mt-4 inline-flex items-center gap-2 text-xs">${openBadge()}</div>
        </div>
      </div>
      <div class="border-t border-white/[.06]">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-mute md:flex-row md:justify-between md:px-10">
          <p>© ${new Date().getFullYear()} ${esc(CONFIG.nombre)}. Todos los derechos reservados.</p>
          <p>Precios y disponibilidad sujetos a cambios sin previo aviso.</p>
        </div>
      </div>
    </footer>
    ${PAGE === 'vehiculo' ? '' : `
    <a href="${waUrl(MSG.general())}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp" class="wa-float fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-bone text-ink transition hover:scale-105 hover:bg-accent">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 01-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 016.7 2.78 9.42 9.42 0 012.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0012.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.63l6.05-1.59a11.36 11.36 0 005.43 1.38h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.06z"/></svg>
    </a>`}`;
  }

  /* ──────────────────────────────────────────────────────────────
     04 · COMPORTAMIENTOS COMUNES (bindings, reveal, contadores)
     ────────────────────────────────────────────────────────────── */
  function bindCommon() {
    $$('[data-cfg]').forEach(el => { const v = CONFIG[el.dataset.cfg]; if (v != null) el.textContent = v; });
    const hrefs = {
      instagram: `https://instagram.com/${CONFIG.instagram.replace('@', '')}`,
      email: `mailto:${CONFIG.email}`,
      reviews: CONFIG.googleReviews,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${mapQuery()}`,
    };
    $$('[data-href]').forEach(el => el.href = hrefs[el.dataset.href] || '#');
    $$('[data-wa]').forEach(el => { el.href = waUrl((MSG[el.dataset.wa] || MSG.general)()); el.target = '_blank'; el.rel = 'noopener'; });
    $$('[data-map]').forEach(el => el.src = `https://www.google.com/maps?q=${mapQuery()}&output=embed`);
    $$('[data-hours]').forEach(el => el.innerHTML = hoursHTML());
    $$('[data-open-status]').forEach(el => el.innerHTML = openBadge());
    $$('[data-stock-count]').forEach(el => el.textContent = stock().length);
  }

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const observe = (root = document) => $$('.reveal:not(.is-in)', root).forEach(el => io.observe(el));

  function countUp(el) {
    const target = CONFIG.metricas[el.dataset.count] ?? 0;
    const dec = +(el.dataset.decimals || 0);
    if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = dec ? (target * e).toFixed(dec) : fmtNum(target * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ──────────────────────────────────────────────────────────────
     05 · PÁGINAS
     ────────────────────────────────────────────────────────────── */
  const Pages = {};

  /* ---------- HOME ---------- */
  Pages.home = () => {
    // Imagen de hero (solo si existe)
    if (CONFIG.heroImage) {
      const img = new Image();
      img.onload = () => $('#heroImg').style.backgroundImage = `url('${CONFIG.heroImage}')`;
      img.src = CONFIG.heroImage;
    }
    // Scrollytelling
    const hero = $('#hero');
    if (hero && !reduceMotion) {
      let ticking = false;
      const update = () => {
        const p = Math.min(Math.max(scrollY / (hero.offsetHeight - innerHeight), 0), 1);
        document.documentElement.style.setProperty('--p', p.toFixed(4));
        ticking = false;
      };
      addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
      update();
    }
    // Destacados: hasta 4, completa con los más nuevos
    const sorted = [...stock()].sort((a, b) => (b.destacado - a.destacado) || (b.anio - a.anio)).slice(0, 4);
    $('#featured').innerHTML = sorted.map((v, i) => card(v, i)).join('');

    // Carrocerías como filas editoriales
    const tipos = uniq(stock(), 'tipo');
    $('#typeRows').innerHTML = tipos.map((t, i) => {
      const n = stock().filter(v => v.tipo === t).length;
      return `<a href="stock.html?tipo=${encodeURIComponent(t)}" class="row-link reveal group flex items-baseline justify-between border-b border-white/[.06] py-6 md:py-8">
        <span class="flex items-baseline gap-6">
          <span class="w-8 font-display text-lg  text-mute">${String(i + 1).padStart(2, '0')}</span>
          <span class="row-label font-display text-5xl md:text-7xl">${esc(t)}</span>
        </span>
        <span class="flex items-center gap-4 text-sm text-mute"><span>${n} ${n === 1 ? 'unidad' : 'unidades'}</span><span class="arrow">→</span></span>
      </a>`;
    }).join('');

    $('#testimonials').innerHTML = TESTIMONIOS.map(testimonialHTML).join('');
  };

  /* ---------- STOCK ---------- */
  Pages.stock = () => {
    const state = {
      q: params.get('q') || '',
      tipo: params.get('tipo') || 'Todos',
      marca: params.get('marca') || '',
      comb: '', trans: '', orden: 'destacados',
    };
    const all = stock();
    const fill = (el, label, opts) => el.innerHTML = `<option value="">${label}</option>` + opts.map(o => `<option>${esc(o)}</option>`).join('');
    fill($('#fMarca'), 'Todas las marcas', uniq(all, 'marca'));
    fill($('#fComb'), 'Combustible', uniq(all, 'combustible'));
    fill($('#fTrans'), 'Transmisión', uniq(all, 'transmision'));
    $('#fMarca').value = state.marca; $('#fQ').value = state.q;

    const chips = $('#typeChips');
    const renderChips = () => chips.innerHTML = ['Todos', ...uniq(all, 'tipo')].map(t => `
      <button type="button" role="tab" aria-selected="${state.tipo === t}" data-tipo="${esc(t)}"
        class="shrink-0 rounded-xl px-4 py-2.5 text-[13px] transition ${state.tipo === t ? 'bg-bone text-ink' : 'text-mute hover:text-bone'}">${esc(t)}</button>`).join('');

    const sorters = {
      'destacados':  (a, b) => (b.destacado - a.destacado) || (b.anio - a.anio),
      'precio-asc':  (a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity),
      'precio-desc': (a, b) => (b.precio ?? -1) - (a.precio ?? -1),
      'anio-desc':   (a, b) => b.anio - a.anio,
      'km-asc':      (a, b) => a.km - b.km,
    };

    const syncUrl = () => {
      const u = new URLSearchParams();
      if (state.q) u.set('q', state.q);
      if (state.tipo !== 'Todos') u.set('tipo', state.tipo);
      if (state.marca) u.set('marca', state.marca);
      history.replaceState(null, '', `${location.pathname}${u.toString() ? '?' + u : ''}`);
    };

    function render() {
      const q = state.q.trim().toLowerCase();
      const list = all
        .filter(v => !q || `${v.marca} ${v.modelo} ${v.version} ${v.anio}`.toLowerCase().includes(q))
        .filter(v => state.tipo === 'Todos' || v.tipo === state.tipo)
        .filter(v => !state.marca || v.marca === state.marca)
        .filter(v => !state.comb || v.combustible === state.comb)
        .filter(v => !state.trans || v.transmision === state.trans)
        .sort(sorters[state.orden]);
      $('#resultCount').textContent = list.length;
      $('#grid').innerHTML = list.map((v, i) => card(v, i)).join('');
      $('#emptyState').classList.toggle('hidden', list.length > 0);
      observe($('#grid'));
      syncUrl();
    }

    chips.addEventListener('click', e => { const b = e.target.closest('[data-tipo]'); if (!b) return; state.tipo = b.dataset.tipo; renderChips(); render(); });
    let t; $('#fQ').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 150); });
    $('#fMarca').addEventListener('change', e => { state.marca = e.target.value; render(); });
    $('#fComb').addEventListener('change', e => { state.comb = e.target.value; render(); });
    $('#fTrans').addEventListener('change', e => { state.trans = e.target.value; render(); });
    $('#fOrden').addEventListener('change', e => { state.orden = e.target.value; render(); });
    $('#clearFilters').addEventListener('click', () => {
      Object.assign(state, { q: '', tipo: 'Todos', marca: '', comb: '', trans: '', orden: 'destacados' });
      ['#fQ', '#fMarca', '#fComb', '#fTrans'].forEach(s => $(s).value = '');
      $('#fOrden').value = 'destacados';
      renderChips(); render();
    });
    renderChips(); render();
  };

  /* ---------- FICHA DE VEHÍCULO ---------- */
  Pages.vehiculo = () => {
    const v = VEHICULOS.find(x => x.id === params.get('id'));
    if (!v) { $('#vehicle').innerHTML = $('#notFound').innerHTML; return; }

    document.title = `${title(v)} ${v.version} ${v.anio} · ${CONFIG.nombre}`;
    $('meta[name="description"]')?.setAttribute('content', `${title(v)} ${v.version} ${v.anio}, ${fmtNum(v.km)} km. ${fmtPrice(v)}. ${v.descripcion || ''}`);

    const fotos = fotosDe(v);

    $('#vehicle').innerHTML = `
      <nav class="mb-8 text-xs text-mute" aria-label="Migas de pan">
        <a href="index.html" class="hover:text-bone">Inicio</a> <span class="mx-2">/</span>
        <a href="stock.html" class="hover:text-bone">Stock</a> <span class="mx-2">/</span>
        <span class="text-bone">${esc(title(v))}</span>
      </nav>

      <div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <!-- Galería -->
        <div class="min-w-0 lg:col-span-7">
          <div class="relative overflow-hidden rounded-3xl border border-white/[.06]">
            <div id="galleryMain">${media(fotos[0], `${title(v)} — foto 1`, v.marca, 'aspect-[4/3]')}</div>
            ${fotos.length > 1 ? `
            <button id="gPrev" class="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-bone backdrop-blur transition hover:bg-black/70" aria-label="Foto anterior">←</button>
            <button id="gNext" class="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-bone backdrop-blur transition hover:bg-black/70" aria-label="Foto siguiente">→</button>
            <span id="gCount" class="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[11px] tracking-wider backdrop-blur">1 / ${fotos.length}</span>` : ''}
            ${v.estado === 'Reservado' ? '<span class="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-wider text-accent backdrop-blur">Reservado</span>' : ''}
          </div>
          ${fotos.length > 1 ? `<div id="thumbs" class="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
            ${fotos.map((f, i) => `<button class="thumb shrink-0 overflow-hidden rounded-xl" data-i="${i}" aria-label="Ver foto ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}>${media(f, '', String(i + 1).padStart(2, '0'), 'h-20 w-28 [&_span]:text-2xl')}</button>`).join('')}
          </div>` : ''}

          <div class="mt-14 grid gap-12 md:grid-cols-2">
            <div>
              <p class="text-[11px] uppercase tracking-eyebrow text-accent">Ficha técnica</p>
              <dl class="mt-4">
                ${specList(v)}
              </dl>
            </div>
            <div>
              ${v.descripcion ? `<p class="text-[11px] uppercase tracking-eyebrow text-accent">Sobre esta unidad</p>
              <p class="mt-4 font-display text-2xl leading-snug">${esc(v.descripcion)}</p>` : ''}
              ${v.equipamiento?.length ? `<p class="mt-10 text-[11px] uppercase tracking-eyebrow text-accent">Equipamiento destacado</p>
              <ul class="mt-4 space-y-3 text-sm">${v.equipamiento.map(e => `<li class="flex gap-3"><span class="text-accent">—</span>${esc(e)}</li>`).join('')}</ul>` : ''}
            </div>
          </div>
        </div>

        <!-- Panel de conversión -->
        <aside class="min-w-0 lg:col-span-5">
          <div class="rounded-3xl border border-white/[.06] bg-coal p-7 md:p-9 lg:sticky lg:top-28">
            <div class="flex items-center justify-between text-[11px] uppercase tracking-eyebrow text-mute">
              <span>${esc(v.marca)} · ${v.anio}</span><span>Ref ${esc(v.id)}</span>
            </div>
            <h1 class="mt-4 font-display text-5xl leading-[.95] md:text-6xl">${esc(v.modelo)}</h1>
            <p class="mt-3 text-mute">${esc(v.version)}</p>
            <div class="mt-6 flex flex-wrap gap-2">${badge(`${fmtNum(v.km)} km`)}${badge(v.combustible)}${badge(v.transmision)}</div>
            <div class="mt-8 border-t border-white/[.06] pt-6">
              <p class="text-[10px] uppercase tracking-eyebrow text-mute">Precio</p>
              <p class="mt-1 font-display text-5xl ${v.precio == null ? ' text-bone/70' : ''}">${fmtPrice(v)}</p>
            </div>
            <div class="mt-8 flex flex-col gap-3">
              <a href="${waUrl(MSG.vehiculo(v))}" target="_blank" rel="noopener" class="rounded-full bg-bone px-6 py-4 text-center text-sm font-medium text-ink transition hover:bg-accent">Consultar por WhatsApp</a>
              <a href="${waUrl(MSG.vehiculoVisita(v))}" target="_blank" rel="noopener" class="rounded-full border border-white/15 px-6 py-4 text-center text-sm transition hover:border-white/40">Coordinar una visita</a>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
              ${v.precio != null ? `<a href="financiacion.html?id=${encodeURIComponent(v.id)}" class="rounded-2xl border border-white/[.06] p-4 transition hover:border-accent/50"><span class="block text-mute">Financiación</span><span class="mt-1 block">Simular cuota →</span></a>` : ''}
              <a href="usado.html?id=${encodeURIComponent(v.id)}" class="rounded-2xl border border-white/[.06] p-4 transition hover:border-accent/50 ${v.precio == null ? 'col-span-2' : ''}"><span class="block text-mute">Tu usado</span><span class="mt-1 block">Entregarlo en parte de pago →</span></a>
            </div>
            <div class="mt-6 inline-flex items-center gap-2 text-xs text-mute">${openBadge()}</div>
          </div>
        </aside>
      </div>`;

    // Galería: flechas, miniaturas, teclado y swipe
    if (fotos.length > 1) {
      let idx = 0;
      const show = i => {
        idx = (i + fotos.length) % fotos.length;
        $('#galleryMain').innerHTML = media(fotos[idx], `${title(v)} — foto ${idx + 1}`, v.marca, 'aspect-[4/3]');
        $('#gCount').textContent = `${idx + 1} / ${fotos.length}`;
        $$('.thumb').forEach((t, j) => t.setAttribute('aria-current', j === idx));
      };
      $('#gPrev').addEventListener('click', () => show(idx - 1));
      $('#gNext').addEventListener('click', () => show(idx + 1));
      $('#thumbs').addEventListener('click', e => { const b = e.target.closest('.thumb'); if (b) show(+b.dataset.i); });
      addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
      let x0 = null;
      const main = $('#galleryMain');
      main.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
      main.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
    }

    // Barra fija mobile (precio + CTA siempre visibles)
    $('#mobileBar').innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0"><p class="truncate text-xs text-mute">${esc(title(v))} ${v.anio}</p><p class="font-display text-2xl">${fmtPrice(v)}</p></div>
        <a href="${waUrl(MSG.vehiculo(v))}" target="_blank" rel="noopener" class="shrink-0 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink">Consultar</a>
      </div>`;

    // Relacionados: mismo tipo primero, después el resto
    const rel = stock().filter(x => x.id !== v.id).sort((a, b) => (b.tipo === v.tipo) - (a.tipo === v.tipo) || Math.abs(a.precio - v.precio) - Math.abs(b.precio - v.precio)).slice(0, 3);
    const relPattern = [{ span: 'lg:col-span-4', h: 'lg:h-[280px]' }];
    $('#related').innerHTML = rel.map((x, i) => card(x, i, relPattern)).join('');
  };

  /* ---------- TU USADO ---------- */
  Pages.usado = () => {
    const interes = VEHICULOS.find(x => x.id === params.get('id'));
    if (interes) {
      $('#interes').classList.remove('hidden');
      $('#interes').innerHTML = `<span class="text-mute">Lo entregás por:</span> <a href="${vUrl(interes)}" class="text-bone underline-offset-4 hover:underline">${esc(title(interes))} ${interes.anio}</a>`;
    }
    const yearSel = $('#uAnio');
    const y = new Date().getFullYear();
    yearSel.innerHTML = '<option value="">Año</option>' + Array.from({ length: 30 }, (_, i) => `<option>${y - i}</option>`).join('');

    $('#usadoForm').addEventListener('submit', e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      const lines = [
        `Hola ${CONFIG.nombre}, quiero cotizar mi usado:`,
        `• Vehículo: ${f.marca} ${f.modelo} ${f.version}`.trim(),
        `• Año: ${f.anio}`,
        `• Kilómetros: ${f.km}`,
        f.estado && `• Estado general: ${f.estado}`,
        f.comentario && `• Comentarios: ${f.comentario}`,
        interes && `Me interesa entregarlo por el ${title(interes)} ${interes.anio} (Ref. ${interes.id}).`,
        'Les mando fotos por acá.',
      ].filter(Boolean);
      window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
    });
  };

  /* ---------- FINANCIACIÓN ---------- */
  Pages.financiacion = () => {
    const F = CONFIG.financiacion;
    const conPrecio = stock().filter(v => v.precio != null);
    const st = { vId: params.get('id') || '', monto: 30000, moneda: 'USD', anticipo: Math.round(F.anticipoMin * 100), cuotas: F.cuotas[2] ?? F.cuotas[0] };

    $('#simVehicle').innerHTML = '<option value="">Ingresar un monto</option>' + conPrecio.map(v => `<option value="${esc(v.id)}">${esc(title(v))} ${v.anio} — ${fmtPrice(v)}</option>`).join('');
    if (!conPrecio.some(v => v.id === st.vId)) st.vId = '';
    $('#simVehicle').value = st.vId;

    const ant = $('#simAnticipo');
    ant.min = Math.round(F.anticipoMin * 100); ant.max = 80; ant.step = 5; ant.value = st.anticipo;

    $('#simCuotas').innerHTML = F.cuotas.map(n => `<button type="button" data-n="${n}" class="rounded-xl border border-white/[.08] px-4 py-3 text-sm transition">${n}</button>`).join('');

    const vehicle = () => conPrecio.find(v => v.id === st.vId);

    function calc() {
      const v = vehicle();
      const precio = v ? v.precio : st.monto;
      const moneda = v ? v.moneda : st.moneda;
      const anticipo = precio * st.anticipo / 100;
      const capital = precio - anticipo;
      const i = F.tna / 12;
      const cuota = i ? capital * i / (1 - Math.pow(1 + i, -st.cuotas)) : capital / st.cuotas;

      $('#manualFields').classList.toggle('hidden', !!v);
      $('#simAnticipoLbl').textContent = `${st.anticipo} %`;
      $$('#simCuotas [data-n]').forEach(b => {
        const on = +b.dataset.n === st.cuotas;
        b.classList.toggle('bg-bone', on); b.classList.toggle('text-ink', on); b.classList.toggle('border-bone', on);
      });
      $('#rCuota').textContent = money(cuota, moneda);
      $('#rCuotas').textContent = `${st.cuotas} cuotas fijas`;
      $('#rPrecio').textContent = money(precio, moneda);
      $('#rAnticipo').textContent = money(anticipo, moneda);
      $('#rCapital').textContent = money(capital, moneda);
      $('#rTotal').textContent = money(anticipo + cuota * st.cuotas, moneda);
      $('#rTna').textContent = `${(F.tna * 100).toFixed(1).replace('.0', '')} %`;

      const msg = [
        `Hola ${CONFIG.nombre}, simulé una financiación en la web:`,
        v ? `• Vehículo: ${title(v)} ${v.anio} (Ref. ${v.id})` : null,
        `• Precio: ${money(precio, moneda)}`,
        `• Anticipo: ${st.anticipo} % (${money(anticipo, moneda)})`,
        `• ${st.cuotas} cuotas de aprox. ${money(cuota, moneda)}`,
        '¿Me confirman condiciones y requisitos?',
      ].filter(Boolean).join('\n');
      $('#simWa').href = waUrl(msg);
    }

    $('#simVehicle').addEventListener('change', e => { st.vId = e.target.value; calc(); });
    $('#simMonto').addEventListener('input', e => { st.monto = Math.max(+e.target.value || 0, 0); calc(); });
    $('#simMoneda').addEventListener('change', e => { st.moneda = e.target.value; calc(); });
    ant.addEventListener('input', e => { st.anticipo = +e.target.value; calc(); });
    $('#simCuotas').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) { st.cuotas = +b.dataset.n; calc(); } });
    $('#simMonto').value = st.monto;
    $('#simAclaracion').textContent = F.aclaracion;
    calc();
  };

  /* ---------- LA AGENCIA ---------- */
  Pages.agencia = () => {
    $('#historia').innerHTML = CONFIG.historia.map(p => `<p>${esc(p)}</p>`).join('');
    $('#faq').innerHTML = CONFIG.faq.map(f => `
      <details class="reveal group border-b border-white/[.06] py-6">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl md:text-3xl">
          ${esc(f.q)}<span class="faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 font-sans text-lg text-mute">+</span>
        </summary>
        <p class="mt-4 max-w-2xl text-[15px] leading-relaxed text-mute">${esc(f.a)}</p>
      </details>`).join('');
    $('#testimonials').innerHTML = TESTIMONIOS.map(testimonialHTML).join('');
  };

  /* ──────────────────────────────────────────────────────────────
     06 · INIT
     ────────────────────────────────────────────────────────────── */
  renderHeader();
  renderFooter();
  bindCommon();
  Pages[PAGE]?.();
  observe();
})();
