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
  blue:    [ 41, 128, 185],
};

const MODE_LABELS = {
  litros:  'Litros de extracto disponibles',
  tiendas: 'Tiendas requeridas',
  bolsas:  'Bolsas de botellas disponibles',
};

const SECTION_COLORS = {
  tiendas:  [92, 61, 30],
  extracto: [41, 128, 185],
  cajas:    [139, 94, 26],
  charolas: [107, 73, 42],
  botellas: [39, 174, 96],
  etiquetas:[142, 68, 173],
};

function txt(doc, rgb, type = 'text') {
  if (type === 'text') doc.setTextColor(...rgb);
  else doc.setFillColor(...rgb);
}

/** Elimina emojis y caracteres no soportados por las fuentes estándar de jsPDF */
function safe(str) {
  return (str || '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // emojis SMP (🌿📦🧴…)
    .replace(/[\u{2600}-\u{27BF}]/gu,    '')  // símbolos misc / dingbats
    .replace(/\uFE0F/g, '')                   // variation selector
    .replace(/\u200D/g, '')                   // zero-width joiner
    .replace(/\s+/g, ' ')
    .trim();
}

function fmtExact(exact) {
  const rounded = parseFloat(exact.toFixed(4));
  if (Number.isInteger(rounded)) return `${rounded.toLocaleString('es-MX')} (exacto)`;
  return parseFloat(exact.toFixed(3)).toLocaleString('es-MX', { maximumFractionDigits: 3 });
}

export function exportToPDF(results, mode, inputValue) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 14; // margin
  const CW = W - M * 2;

  // ── Gold top bar ──────────────────────────────────────────────────────────
  txt(doc, C.gold, 'fill');
  doc.rect(0, 0, W, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  txt(doc, C.white);
  doc.text('Crystal Vanilla', W / 2, 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Calculadora de Producción', W / 2, 22, { align: 'center' });

  // ── Ivory background ──────────────────────────────────────────────────────
  txt(doc, C.ivory, 'fill');
  doc.rect(0, 30, W, 267, 'F');

  // ── Date + Input ──────────────────────────────────────────────────────────
  let y = 36;
  const date = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFontSize(8.5);
  txt(doc, C.medium);
  doc.text(`Generado: ${date}`, W / 2, y, { align: 'center' });

  y += 6;
  txt(doc, C.card, 'fill');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, 14, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  txt(doc, C.dark);
  doc.text(`${MODE_LABELS[mode]}:`, M + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  txt(doc, C.accent);
  doc.text(
    `${Number(inputValue).toLocaleString('es-MX')}`,
    M + 4 + doc.getTextWidth(`${MODE_LABELS[mode]}: `) + 1,
    y + 6
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  txt(doc, C.medium);
  doc.text('(todos los cálculos usan Math.ceil — redondeo hacia arriba)', M + 4, y + 11);

  y += 20;

  // ── Tarjetas de litros (solo modo litros) ─────────────────────────────────
  if (mode === 'litros' && results.litrosFaltantes != null) {
    const halfW = (CW - 4) / 2;

    // Tarjeta FALTAN (izquierda)
    const warnColor = results.litrosFaltantes === 0 ? [39, 174, 96] : [192, 100, 30];
    txt(doc, warnColor, 'fill');
    doc.roundedRect(M, y, halfW, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    txt(doc, C.white);
    const warnLabel = results.litrosFaltantes === 0
      ? 'Litros exactos'
      : `Faltan para tienda ${results.tiendas}`;
    doc.text(warnLabel, M + 3, y + 5);
    doc.setFontSize(14);
    doc.text(
      results.litrosFaltantes.toLocaleString('es-MX'),
      M + 3, y + 13
    );
    doc.setFontSize(7);
    doc.text('litros', M + halfW - 3, y + 13, { align: 'right' });

    // Tarjeta SOBRAN (derecha)
    txt(doc, [39, 174, 96], 'fill');
    doc.roundedRect(M + halfW + 4, y, halfW, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    txt(doc, C.white);
    const okLabel = results.litrosSobrantes === 0
      ? 'Sin excedente'
      : `Sobran con ${results.tiendasCompletas} tiendas`;
    doc.text(okLabel, M + halfW + 7, y + 5);
    doc.setFontSize(14);
    doc.text(
      results.litrosSobrantes.toLocaleString('es-MX'),
      M + halfW + 7, y + 13
    );
    doc.setFontSize(7);
    doc.text('litros', M + CW - 3, y + 13, { align: 'right' });

    y += 22;
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  for (const section of SECTIONS) {
    const secRgb = SECTION_COLORS[section.id] || C.gold;

    // Section title bar
    txt(doc, secRgb, 'fill');
    doc.rect(M, y, CW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    txt(doc, C.white);
    doc.text(safe(section.title), M + 3, y + 5);
    y += 9;

    // Cards
    const colW = (CW - 4) / 2;
    let colIdx = 0;
    let rowStartY = y;
    let maxRowH = 0;

    for (const item of section.items) {
      const cx = M + colIdx * (colW + 4);
      const cy = rowStartY;

      const isPkg = item.type === 'pkg';
      const cardH = isPkg ? 28 : 18;

      // Card background
      txt(doc, C.card, 'fill');
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, colW, cardH, 2, 2, 'FD');

      // Left accent
      txt(doc, secRgb, 'fill');
      doc.rect(cx, cy, 2, cardH, 'F');

      // Icon + label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      txt(doc, C.medium);
      doc.text(safe(`${item.icon}  ${item.label}`), cx + 4, cy + 6);

      if (item.type === 'simple') {
        const val = results[item.key];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        txt(doc, C.dark);
        doc.text(
          val != null ? Number(val).toLocaleString('es-MX') : '—',
          cx + 4, cy + 14
        );
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        txt(doc, C.medium);
        doc.text(item.unit, cx + colW - 3, cy + 14, { align: 'right' });

      } else {
        // pkg card
        const pd = results[item.key];
        if (pd) {
          // Needed (big)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          txt(doc, C.dark);
          doc.text(pd.needed.toLocaleString('es-MX'), cx + 4, cy + 13);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          txt(doc, C.medium);
          doc.text(item.unit, cx + colW - 3, cy + 13, { align: 'right' });

          // Breakdown rows
          const exactStr = `Exacto: ${fmtExact(pd.exact)} ${item.unit}`;
          doc.setFontSize(7);
          txt(doc, C.dark);
          doc.text(exactStr, cx + 4, cy + 18);

          if (!pd.isExact) {
            txt(doc, C.green);
            doc.text(
              `Usas del último: ${pd.usedInLast.toLocaleString('es-MX')} ${pd.itemUnit}`,
              cx + 4, cy + 22.5
            );
            txt(doc, C.red);
            doc.text(
              `Sobran: ${pd.leftover.toLocaleString('es-MX')} ${pd.itemUnit}`,
              cx + 4, cy + 27
            );
          }
        }
      }

      maxRowH = Math.max(maxRowH, cardH);

      colIdx++;
      if (colIdx >= 2) {
        colIdx = 0;
        rowStartY += maxRowH + 3;
        maxRowH = 0;
      }
    }

    if (colIdx > 0) {
      rowStartY += maxRowH + 3;
    }
    y = rowStartY + 2;

    // Check page overflow
    if (y > 260) {
      doc.addPage();
      txt(doc, C.ivory, 'fill');
      doc.rect(0, 0, W, 297, 'F');
      y = 14;
    }
  }

  // ── Reference table ───────────────────────────────────────────────────────
  if (y + 60 > 270) {
    doc.addPage();
    txt(doc, C.ivory, 'fill');
    doc.rect(0, 0, W, 297, 'F');
    y = 14;
  }

  txt(doc, C.gold, 'fill');
  doc.rect(M, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  txt(doc, C.white);
  doc.text('Tabla de Equivalencias', M + 3, y + 5);
  y += 9;

  const refs = [
    ['1 tienda',              '11 cajas · 110 litros · 220 botellas'],
    ['1 caja',                '10 litros · 20 botellas'],
    ['1 paquete de cajas',    '20 cajas (= charolas, es lo mismo)'],
    ['1 bolsa de botellas',   '200 botellas'],
    ['1 rollo de etiquetas',  '1,000 etiquetas'],
  ];

  refs.forEach(([left, right], i) => {
    if (i % 2 === 0) {
      txt(doc, [248, 243, 220], 'fill');
      doc.rect(M, y - 3.5, CW, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    txt(doc, C.dark);
    doc.text(left, M + 3, y + 0.5);
    doc.setFont('helvetica', 'normal');
    txt(doc, C.medium);
    doc.text(`= ${right}`, M + 58, y + 0.5);
    y += 7;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  txt(doc, C.dark, 'fill');
  doc.rect(0, 285, W, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  txt(doc, [245, 200, 66]);
  doc.text(
    'Crystal Vanilla © 2025 — Producción y Logística',
    W / 2, 292, { align: 'center' }
  );

  doc.save(`CrystalVanilla_${mode}_${inputValue}_${Date.now()}.pdf`);
}
