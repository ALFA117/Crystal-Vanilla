<div align="center">

<img src="LOGO/Crystal%20Vanilla.png" alt="Crystal Vanilla logo: gold lettering and a vanilla flower on a chocolate background" width="280" />

# Crystal Vanilla

### Production calculator and inventory manager for a vanilla-extract business: from liters of extract to a full production order.

[![Live app](https://img.shields.io/badge/Live_app-crystall--vanilla.vercel.app-45261F?style=for-the-badge&logo=vercel&logoColor=white)](https://crystall-vanilla.vercel.app)
![Freelance project](https://img.shields.io/badge/Freelance-client_project-D8A73E?style=for-the-badge)
[![License MIT](https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge)](LICENSE)

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)
![jsPDF](https://img.shields.io/badge/jsPDF_+_html2canvas-PDF-B91C1C)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

<br/>

<img src="docs/img/hero.jpg" alt="Crystal Vanilla on a laptop and a phone: production order for 1,250 liters of extract" width="100%" />

**[▶ Open the calculator](https://crystall-vanilla.vercel.app)** · **[User manual (ES)](MANUAL_USUARIO.md)** · **[Technical manual (ES)](MANUAL_TECNICO.md)**

</div>

> [!NOTE]
> **Status (Nov 2026):** the calculator works without an account. The inventory server (Supabase) is not responding, so the app shows **Inventario: Sin conexión** and the login warns that you can't sign in for now.

---

## 🎯 The problem

The business sells vanilla extract to stores in fixed runs: **1 store = 11 boxes = 110 liters = 220 bottles**. Every production decision meant doing the math by hand: how many full store runs the available extract covers, what is left over, how much is missing for the next run, and how many packs of boxes, bags of bottles and rolls of labels to order.

## 💡 The solution

Pick what you have (**liters of extract** or **number of stores to supply**), type a whole number and get a production order:

**Example with 1,250 liters (from the live app):**

| Result | Value |
|:--|:--|
| Full store runs | **11** (1,210 liters used) |
| Left over | 40 liters, enough for 4 of the 11 boxes of store 12 |
| Missing for store 12 | 70 liters (7 boxes of 10 liters) |
| Boxes (trays) | 121 boxes → 7 packs of 20 (19 left over) |
| Bottles | 2,420 → 13 bags of 200 (180 left over) |
| Labels | 2,420 → 3 rolls of 1,000 (580 left over) |

Every result can be downloaded as a **PDF report**.

## ✨ Features

<table>
<tr>
<td width="50%"><img src="docs/img/home.jpg" alt="Calculator start screen: choose liters or stores, enter the value, equivalence table" /><br/><b>Two modes:</b> liters → stores or stores → liters, with the equivalence table always visible and the client's real minimum batch (110 L) enforced.</td>
<td width="50%"><img src="docs/img/materiales.jpg" alt="Materials table: boxes, bottles and labels with pieces, packs, last pack and leftovers" /><br/><b>Materials in one table:</b> pieces, packs rounded up (with the exact value), how many are used from the last pack and what is left over.</td>
</tr>
<tr>
<td width="50%"><img src="docs/img/login.jpg" alt="Inventory sign-in dialog with a notice that the inventory server is not responding" /><br/><b>Inventory with roles:</b> staff sign in to track bottles, trays, caps and labels. <code>admin</code> edits stock, sees the activity log and manages users; <code>employee</code> gets read-only access.</td>
<td width="50%"><b>Also included</b><br/><br/>
• PDF export with jsPDF + html2canvas, loaded only when you press «Descargar PDF»<br/>
• Activity log of inventory changes, password changes and new users<br/>
• Row Level Security on every table (<code>usuarios</code>, <code>almacen</code>, <code>logs</code>)<br/>
• Responsive layout: on desktop the result appears next to the form, on mobile it scrolls to the result</td>
</tr>
</table>

## 🧠 How it works

```mermaid
flowchart LR
    U["Staff member"] -->|"liters or stores"| C["Calculator - calculations.js"]
    C -->|"production order"| R["Results and materials"]
    R -->|"Descargar PDF"| P["jsPDF and html2canvas"]
    U -->|"sign in"| A["Supabase Auth"]
    A -->|"role admin or employee"| I["Inventory panel"]
    I -->|"RLS"| DB[("Supabase Postgres - usuarios, almacen, logs")]
```

The calculation logic lives in [`src/utils/calculations.js`](src/utils/calculations.js) and runs entirely in the browser; Supabase is only used for sign-in and inventory. The database is created with `database/reset_completo.sql` (see the [technical manual](MANUAL_TECNICO.md)).

## 🛠️ Stack

| Layer | Technology |
|:--|:--|
| Frontend | React 19 + Vite 8 · Framer Motion |
| PDF | jsPDF + html2canvas |
| Auth and data | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |

## 🚀 Run locally

```bash
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

## 📂 Documentation

- [MANUAL_USUARIO.md](MANUAL_USUARIO.md): end-user guide (Spanish).
- [MANUAL_TECNICO.md](MANUAL_TECNICO.md): technical reference: structure, calculation logic, roles and database (Spanish).
- [docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md): Nov 2026 redesign notes (Spanish).

## 📄 License

[MIT](LICENSE)

---

<div align="center">

<sub>Built by <a href="https://github.com/ALFA117">ALFA117</a> as a freelance client project for Crystal Vanilla</sub>

</div>
