# Carpeta de imágenes

Las fotos se cargan solas por nombre de archivo. Si una foto falta, el sitio muestra un placeholder oscuro con la marca, así que nunca queda una imagen rota.

```
img/
├── brand/
│   ├── logo.svg        → logo (activalo en data.js → CONFIG.logo)
│   ├── favicon.png     → 512×512, fondo transparente o #0B0B0B
│   └── og.jpg          → 1200×630, vista previa al compartir el link
├── hero/
│   └── hero.jpg        → foto de fondo del inicio, 2400×1600, horizontal
├── agencia/
│   └── salon.jpg       → foto del salón/fachada para "La agencia", 1600×1200
└── autos/
    ├── a01/            → una carpeta por vehículo, con el id en minúscula
    │   ├── 01.jpg      → portada (la que aparece en la grilla)
    │   ├── 02.jpg
    │   └── …
    └── a02/ …
```

## Autos

1. En `assets/js/data.js`, cada vehículo tiene un `id` (ej. `A01`) y un campo `fotos` (cuántas hay).
2. Creá la carpeta `img/autos/a01/` (id en minúscula).
3. Subí las fotos numeradas con dos dígitos: `01.jpg`, `02.jpg`, `03.jpg`…
4. `01.jpg` es la portada: frente o tres cuartos de adelante, auto centrado.

Para un auto nuevo: agregalo en `data.js` con un id nuevo (ej. `A08`) y creá `img/autos/a08/`.

## Recomendaciones

- Formato **.jpg**, horizontal **4:3**, 1600×1200 px. Si usás otra proporción, se recorta al centro.
- Peso ideal: menos de 300 KB por foto (comprimí en squoosh.app o tinyjpg.com).
- Misma luz y mismo fondo en todas las portadas: es lo que más suma a la estética premium.
- Orden sugerido: 01 frente ¾ · 02 lateral · 03 trasera ¾ · 04 interior · 05 tablero · 06 detalle (llantas, butacas).
