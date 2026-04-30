import jsPDF from 'jspdf';
import { SECTIONS } from './calculations';

const C = {
  gold:    [212, 160,  23],
  dark:    [ 59,  42,  26],
  medium:  [107,  76,  42],
  accent:  [232, 160,  32],
  ivory:   [255, 255, 240],
  card:    [255, 253, 231],
  border:  [240, 180,  41],
  white:   [250, 247, 240],
  green:   [ 30, 132,  73],
  red:     [192,  57,  43],
  orange:  [192, 100,  30],
  blue:    [ 41, 128, 185],
};

const MODE_LABELS = {
  litros:  'Litros de extracto disponibles',
  tiendas: 'Tiendas requeridas',
};

const SECTION_COLORS = {
  tiendas:  [92,  61,  30],
  extracto: [41, 128, 185],
  cajas:    [139, 94,  26],
  botellas: [39, 174,  96],
  etiquetas:[142, 68, 173],
};

function txt(doc, rgb, type = 'text') {
  if (type === 'text') doc.setTextColor(...rgb);
  else doc.setFillColor(...rgb);
}

function safe(str) {
  return (str || '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu,   '')
    .replace(/️/g, '')
    .replace(/‍/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fmtExact(exact) {
  const rounded = parseFloat(exact.toFixed(4));
  if (Number.isInteger(rounded)) return `${rounded.toLocaleString('es-MX')} (exacto)`;
  return parseFloat(exact.toFixed(3)).toLocaleString('es-MX', { maximumFractionDigits: 3 });
}

function addPage(doc) {
  doc.addPage();
  txt(doc, C.ivory, 'fill');
  doc.rect(0, 0, 210, 297, 'F');
  return 14;
}

function drawCardBase(doc, cx, cy, w, h, secRgb) {
  txt(doc, C.card, 'fill');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(cx, cy, w, h, 2, 2, 'FD');
  txt(doc, secRgb, 'fill');
  doc.rect(cx, cy, 2, h, 'F');
}

export function exportToPDF(results, mode, inputValue) {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const W    = 210;
  const M    = 14;
  const CW   = W - M * 2;
  const colW = (CW - 4) / 2;

  // ── Header dorado ─────────────────────────────────────────────────────────
  txt(doc, C.gold, 'fill');
  doc.rect(0, 0, W, 33, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  txt(doc, C.white);
  doc.text('Crystal Vanilla', W / 2, 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Calculadora de Produccion', W / 2, 21, { align: 'center' });

  doc.setFontSize(7.5);
  txt(doc, [255, 240, 170]);
  const modeStr = mode === 'litros' ? 'Modo: Litros de Extracto' : 'Modo: Tiendas Requeridas';
  doc.text(modeStr, W / 2, 29, { align: 'center' });

  // ── Fondo marfil ──────────────────────────────────────────────────────────
  txt(doc, C.ivory, 'fill');
  doc.rect(0, 33, W, 264, 'F');

  let y = 39;

  // ── Fecha ─────────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  txt(doc, C.medium);
  doc.text(`Generado: ${date}`, W / 2, y, { align: 'center' });

  y += 5;

  // ── Recuadro de entrada ───────────────────────────────────────────────────
  txt(doc, C.card, 'fill');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, 13, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  txt(doc, C.medium);
  doc.text(MODE_LABELS[mode] + ':', M + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  txt(doc, C.dark);
  doc.text(Number(inputValue).toLocaleString('es-MX'), M + CW - 4, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  txt(doc, C.medium);
  doc.text('Todos los calculos usan Math.ceil (redondeo hacia arriba)', M + 4, y + 11);

  y += 18;

  // ── Secciones ─────────────────────────────────────────────────────────────
  for (const section of SECTIONS) {
    if (y > 255) y = addPage(doc);

    const secRgb = SECTION_COLORS[section.id] || C.gold;

    // Barra de título de sección
    txt(doc, secRgb, 'fill');
    doc.roundedRect(M, y, CW, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    txt(doc, C.white);
    doc.text(safe(section.title), M + 4, y + 5);
    y += 9;

    let colIdx    = 0;
    let rowStartY = y;
    let maxRowH   = 0;

    // ── Tarjetas normales de la sección ──
    for (const item of section.items) {
      // En modo litros, la tarjeta de tiendas la manejamos aparte
      if (mode === 'litros' && section.id === 'tiendas' && item.key === 'tiendas') continue;

      const cx      = M + colIdx * (colW + 4);
      const cy      = rowStartY;
      const isPkg   = item.type === 'pkg';
      const cardH   = isPkg ? 32 : 18;

      drawCardBase(doc, cx, cy, colW, cardH, secRgb);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      txt(doc, C.medium);
      doc.text(safe(`${item.icon}  ${item.label}`), cx + 4, cy + 5.5);

      if (item.type === 'simple') {
        const val = results[item.key];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        txt(doc, C.dark);
        doc.text(val != null ? Number(val).toLocaleString('es-MX') : '—', cx + 4, cy + 13.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        txt(doc, C.medium);
        doc.text(item.unit, cx + colW - 3, cy + 13.5, { align: 'right' });
      } else {
        const pd = results[item.key];
        if (pd) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          txt(doc, C.dark);
          doc.text(pd.needed.toLocaleString('es-MX'), cx + 4, cy + 13);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          txt(doc, C.medium);
          doc.text(item.unit, cx + colW - 3, cy + 13, { align: 'right' });
          doc.setFontSize(6.5);
          txt(doc, C.dark);
          doc.text(`Exacto: ${fmtExact(pd.exact)} ${item.unit}`, cx + 4, cy + 18.5);
          if (!pd.isExact) {
            txt(doc, C.green);
            doc.text(`Usas del ultimo: ${pd.usedInLast.toLocaleString('es-MX')} ${pd.itemUnit}`, cx + 4, cy + 23);
            txt(doc, C.red);
            doc.text(`Sobran: ${pd.leftover.toLocaleString('es-MX')} ${pd.itemUnit}`, cx + 4, cy + 27.5);
          }
        }
      }

      maxRowH = Math.max(maxRowH, cardH);
      colIdx++;
      if (colIdx >= 2) { colIdx = 0; rowStartY += maxRowH + 3; maxRowH = 0; }
    }

    // ── Tarjeta Tiendas Completas — ancho completo (sección tiendas, modo litros) ──
    if (section.id === 'tiendas' && mode === 'litros' && results.litrosFaltantes != null) {
      // Flush fila parcial si hay algo antes
      if (colIdx > 0) { rowStartY += maxRowH + 3; colIdx = 0; maxRowH = 0; }

      const cy           = rowStartY;
      const hasFaltantes = results.litrosSobrantes > 0;
      const cardH        = hasFaltantes ? 22 : 18;

      // Tarjeta ancho completo
      drawCardBase(doc, M, cy, CW, cardH, secRgb);

      // Etiqueta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      txt(doc, C.medium);
      doc.text('Tiendas Completas', M + 4, cy + 5.5);

      // Número grande (izquierda)
      const numVal = hasFaltantes ? results.tiendasCompletas : results.tiendas;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      txt(doc, C.dark);
      doc.text(numVal.toLocaleString('es-MX'), M + 4, cy + 14);

      // Unidad (derecha)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      txt(doc, C.medium);
      doc.text('tiendas', M + CW - 4, cy + 14, { align: 'right' });

      // Subtext en una sola línea (cabe porque es CW de ancho)
      if (hasFaltantes) {
        doc.setFontSize(7);
        txt(doc, C.orange);
        const cajas = Math.ceil(results.litrosFaltantes / 10);
        doc.text(
          `Faltan ${results.litrosFaltantes.toLocaleString('es-MX')} litros / ${cajas} cajas para completar ${results.tiendas} tiendas`,
          M + 4, cy + 19.5
        );
      } else {
        doc.setFontSize(7);
        txt(doc, C.green);
        doc.text('Litros exactos  ✓', M + 4, cy + 19);
      }

      rowStartY += cardH + 3;
    }

    // Flush fila incompleta
    if (colIdx > 0) rowStartY += maxRowH + 3;
    y = rowStartY + 2;

    // ── Tarjetas FALTAN / SOBRAN litros (sección extracto, modo litros) ──
    if (section.id === 'extracto' && mode === 'litros' && results.litrosFaltantes != null) {
      if (y > 240) y = addPage(doc);

      const hW       = colW;
      const litCardH = 28;

      // Tarjeta FALTAN (izquierda)
      const warnRgb = results.litrosFaltantes === 0 ? C.green : C.orange;
      txt(doc, warnRgb, 'fill');
      doc.roundedRect(M, y, hW, litCardH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      txt(doc, C.white);
      const warnLabel = results.litrosFaltantes === 0
        ? 'Litros exactos'
        : `Para completar ${results.tiendas} tiendas`;
      doc.text(warnLabel, M + 3, y + 5.5);
      doc.setFontSize(18);
      doc.text(results.litrosFaltantes.toLocaleString('es-MX'), M + 3, y + 17);
      doc.setFontSize(7);
      doc.text('litros', M + hW - 3, y + 17, { align: 'right' });
      if (results.litrosFaltantes > 0) {
        doc.setFontSize(6);
        doc.text(
          `Tienes ${Number(inputValue).toLocaleString('es-MX')}, necesitas ${results.litrosTotales.toLocaleString('es-MX')}`,
          M + 3, y + 25
        );
      }

      // Tarjeta SOBRAN (derecha)
      txt(doc, C.green, 'fill');
      doc.roundedRect(M + hW + 4, y, hW, litCardH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      txt(doc, C.white);
      const okLabel = results.litrosSobrantes === 0
        ? 'Sin excedente'
        : `Sobran con ${results.tiendasCompletas} tiendas`;
      doc.text(okLabel, M + hW + 7, y + 5.5);
      doc.setFontSize(18);
      doc.text(results.litrosSobrantes.toLocaleString('es-MX'), M + hW + 7, y + 17);
      doc.setFontSize(7);
      doc.text('litros', M + CW - 3, y + 17, { align: 'right' });
      if (results.litrosSobrantes > 0) {
        doc.setFontSize(6);
        doc.text(
          `${results.tiendasCompletas} tiendas completas usan ${(results.tiendasCompletas * 110).toLocaleString('es-MX')} litros`,
          M + hW + 7, y + 25
        );
      }

      y += litCardH + 4;
    }

    if (y > 255) y = addPage(doc);
  }

  // ── Tabla de equivalencias ────────────────────────────────────────────────
  if (y + 55 > 275) y = addPage(doc);

  txt(doc, C.gold, 'fill');
  doc.roundedRect(M, y, CW, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  txt(doc, C.white);
  doc.text('Tabla de Equivalencias', M + 4, y + 5);
  y += 9;

  const refs = [
    ['1 tienda',             '11 cajas  ·  110 litros  ·  220 botellas'],
    ['1 caja (charola)',      '10 litros  ·  20 botellas'],
    ['1 paquete de cajas',   '20 cajas'],
    ['1 bolsa de botellas',  '200 botellas'],
    ['1 rollo de etiquetas', '1,000 etiquetas'],
  ];

  refs.forEach(([left, right], i) => {
    if (i % 2 === 0) {
      txt(doc, [248, 243, 220], 'fill');
      doc.rect(M, y - 3.5, CW, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    txt(doc, C.dark);
    doc.text(left, M + 4, y + 0.5);
    doc.setFont('helvetica', 'normal');
    txt(doc, C.medium);
    doc.text(`= ${right}`, M + 62, y + 0.5);
    y += 7;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  txt(doc, C.dark, 'fill');
  doc.rect(0, 285, W, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  txt(doc, [245, 200, 66]);
  doc.text('Crystal Vanilla © 2025 — Produccion y Logistica', W / 2, 292, { align: 'center' });

  doc.save(`CrystalVanilla_${mode}_${inputValue}_${Date.now()}.pdf`);
}
