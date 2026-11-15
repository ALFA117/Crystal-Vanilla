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

## DESIGN_NOTES (rediseño pro, nov 2026)

- **Dirección:** herramienta de trabajo formal con la marca del cliente (chocolate + oro de vainilla del logo). Retícula bento en el resultado, bordes definidos de 1.5 px y sombras duras discretas; sin partículas ni fondos animados.
- **Tipografía:** Marcellus (display, eco de las capitales del logo) · Public Sans (texto) · IBM Plex Mono (cantidades).
- **Colores con significado fijo:** oro `#D8A73E` = acción principal · verde `#2E6A45` = exacto/correcto · terracota `#9C3D1C` = falta material o error · chocolate `#45261F` = marca. Contraste AA verificado.
- **Recorrido:** antes: elegir modo → escribir → Calcular → bajar a ver 5 secciones de tarjetas. Ahora: elegir modo → escribir → Calcular (o Enter); en escritorio el resultado aparece al lado sin desplazarse y los materiales quedan en una sola tabla (en móvil baja solo al resultado).
- La lógica de cálculo (`src/utils/calculations.js`) y el PDF (`src/utils/pdfExport.js`) no cambiaron; jsPDF ahora se carga al pulsar «Descargar PDF».
