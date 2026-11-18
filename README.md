# Core Template · Concesionarias

Sitio multipágina, estático (HTML + Tailwind + JS sin frameworks). Se puede abrir con doble clic o subir tal cual a Vercel o Netlify.

## Páginas

| Archivo              | Qué es                                                         |
|----------------------|----------------------------------------------------------------|
| `index.html`         | Inicio: hero, métricas, destacados, carrocerías, testimonios   |
| `stock.html`         | Catálogo completo con buscador y filtros (se pueden compartir por URL: `stock.html?tipo=SUV`) |
| `vehiculo.html?id=A01` | Ficha: galería, specs, CTAs de WhatsApp, relacionados        |
| `usado.html`         | Formulario de tasación → arma el mensaje de WhatsApp           |
| `financiacion.html`  | Simulador de cuota → manda la simulación por WhatsApp          |
| `agencia.html`       | Historia, ubicación, horarios en vivo, FAQ                     |

## Para cargar una agencia nueva

1. **`assets/js/data.js`**: nombre, WhatsApp, dirección, horarios, stock, testimonios, FAQ y tasa de financiación.
2. **`img/`**: fotos (ver `img/README.md`).
3. **`assets/js/tailwind.config.js`**: color de acento (`accent`) si la marca lo pide.
4. Títulos de pestaña y `meta description` en el `<head>` de cada HTML.

## Estructura

```
├── *.html                    páginas (solo maquetación propia de cada una)
├── assets/
│   ├── css/styles.css        animaciones y estilos que Tailwind no cubre
│   └── js/
│       ├── tailwind.config.js  tokens de diseño (colores, fuentes)
│       ├── data.js             datos de la agencia  ← se edita
│       └── app.js              header, footer y lógica de cada página
└── img/                      fotos
```

El header y el footer se escriben una sola vez en `app.js` y se insertan en todas las páginas.

## Producción

Tailwind por CDN sirve para iterar. Antes de publicar, conviene compilarlo con `npx tailwindcss`, usando el config de `assets/js/tailwind.config.js` y `content: ['./*.html', './assets/js/*.js']`, y reemplazar el `<script>` del CDN por el CSS generado.
