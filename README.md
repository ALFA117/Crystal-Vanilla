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
