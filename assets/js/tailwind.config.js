/* Tokens de diseño. Cambiá 'accent' por el color de marca de cada agencia. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0B',        // fondo base
        coal: '#111111',       // superficies
        smoke: '#181818',      // tarjetas / placeholders
        bone: '#EDEAE4',       // texto principal
        mute: '#8A8780',       // texto secundario
        accent: '#D3202A',     // rojo Bustelo (del logo)
      },
      fontFamily: {
        display: ['Onest', 'system-ui', 'sans-serif'],   // títulos
        sans: ['Onest', 'system-ui', 'sans-serif'],      // cuerpo
      },
      letterSpacing: { eyebrow: '0.28em' },
    },
  },
};
