# Crystal Vanilla

A production calculator and inventory manager for a vanilla-extract business, built as a freelance client project.

## What it does

- **Production calculator** — convert available extract (liters) into sellable units (boxes, bottles, labels), or work backwards from a target number of stores to supply. Enforces the client's real minimum batch size (110L = 1 complete store run) and shows exactly what's short of the next full batch.
- **PDF export** — every calculation can be downloaded as a printable report (`jspdf` + `html2canvas`).
- **Inventory** — track stock of bottles, trays, caps, and labels.
- **Role-based login** — `admin` / `employee` accounts via Supabase, gating who can edit inventory vs. just run calculations.

See [`MANUAL_USUARIO.md`](./MANUAL_USUARIO.md) (end-user guide) and [`MANUAL_TECNICO.md`](./MANUAL_TECNICO.md) (technical reference) for full detail.

## Stack

- React 19 + Vite
- Supabase (auth + data)
- framer-motion, tsparticles (UI)
- jspdf + html2canvas (PDF export)

## Run locally

```bash
npm install
npm run dev
```

## FIX_NOTES (rediseño /diseno, 2026-10-11)

- **Emojis como íconos** (🌿 📊 📦 💧 🏪 🔐 👁️ …, unos 80 en 15 archivos): se veían distinto en cada sistema, en colores que chocaban con la paleta café y oro, y algunos salían como cuadros. Ahora son SVG de trazo (`src/components/Glyph.jsx`) que heredan el color de cada lugar. Los datos (`calculations.js`, inventarios) no cambiaron: el componente traduce el mismo emoji a su ícono. Se quitó el ⏳ de los textos "Guardando…".
- **Contraste**: el café secundario `#9E7B4A` (≈3.9:1 sobre marfil) y `#B8956A` (≈2.9:1), usados en unidades, fechas, usuarios y equivalencias del panel, pasaron a `#7A5A32` y `#7F6038` (≥5:1).
- **Texto por debajo de 12 px**: 24 reglas en 0.65–0.73 rem subieron a 0.75 rem.
- **Favicon equivocado**: era el logo por defecto de Vite. Ahora es una flor de vainilla de cinco pétalos en el oro y café de la marca, más `apple-touch-icon.png`.
- **SEO**: `lang="en"` pasó a `"es"`, y se agregaron descripción, canonical, Open Graph y X con `og.png` (captura real), `theme-color`, manifest, `robots.txt` y `sitemap.xml`. Se agregó `100dvh` donde había `100vh`.

## DESIGN_NOTES

- **Fondo 3D: el dado sacó la receta 6 (malla low-poly con Three.js).** Se adaptó como una **gota de extracto de vainilla**: un icosaedro deformado en forma de gota, de alambre ámbar, que respira y gira despacio, con un núcleo dorado adentro. Alrededor flotan **semillas de vainilla** (motas café) y **destellos dorados**. Sobre el marfil va tenue y tiene un velo claro en el centro, para que los números de la calculadora siempre ganen. El puntero mueve la cámara y el scroll la aleja. Three.js se carga aparte, cuando el navegador queda libre. DPR ≤ 2, pausa con la pestaña oculta, menos partículas en celular y un cuadro quieto con `prefers-reduced-motion`. `src/components/ExtractScene.jsx` reemplaza a tsParticles, que se usaba para 55 puntos y estrellas (las dependencias `@tsparticles/*` siguen en `package.json` pero ya no se importan; se pueden quitar). Dependencia nueva: `three@0.170.0`.
- **No se hizo modo oscuro.** La identidad del cliente es marfil y vainilla, y el café oscuro se usa a la vez como fondo del encabezado y como color de texto, así que invertir los tokens rompería el header. Queda como decisión documentada.

### Checklist de 2 minutos en el celular

1. Abre la calculadora: abajo a la derecha flota la gota dorada con motas, sin scroll horizontal.
2. Los íconos de "Tengo litros", "Necesito tiendas", el campo de litros y "Calcular" son trazos dorados o café, no emojis.
3. Calcula 1100 litros: las tarjetas de resultado muestran sus íconos y el PDF se descarga igual que antes.
4. En el panel (Ingresar), las fechas y unidades se leen sin esfuerzo.
5. El ícono de la pestaña es la flor de vainilla.
