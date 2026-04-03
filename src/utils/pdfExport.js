import jsPDF from 'jspdf';
import { RESULT_CARDS } from './calculations';

const COLORS = {
  gold:      [212, 160,  23],
  dark:      [ 59,  42,  26],
  medium:    [107,  76,  42],
  accent:    [232, 160,  32],
  ivory:     [255, 255, 224],
  cardBg:    [255, 253, 231],
  border:    [240, 180,  41],
  white:     [250, 247, 240],
};

const MODE_LABELS = {
  litros:  'Litros de extracto disponibles',
  tiendas: 'Tiendas requeridas',
  bolsas:  'Bolsas de botellas disponibles',
};

function setColor(doc, rgb, type = 'text') {
  if (type === 'text') doc.setTextColor(...rgb);
  else doc.setFillColor(...rgb);
}

export function exportToPDF(results, mode, inputValue) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  const contentW = W - margin * 2;

  // ── Background ──────────────────────────────────────────────────────────
  setColor(doc, COLORS.ivory, 'fill');
  doc.rect(0, 0, 210, 297, 'F');

  // ── Gold top bar ────────────────────────────────────────────────────────
  setColor(doc, COLORS.gold, 'fill');
  doc.rect(0, 0, 210, 28, 'F');

  // ── Title ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  setColor(doc, COLORS.white);
  doc.text('🌿 Crystal Vanilla', W / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  setColor(doc, COLORS.white);
  doc.text('Calculadora de Producción', W / 2, 21, { align: 'center' });

  // ── Date ────────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFontSize(9);
  setColor(doc, COLORS.medium);
  doc.text(`Generado: ${date}`, W / 2, 33, { align: 'center' });

  // ── Input summary box ───────────────────────────────────────────────────
  let y = 38;
  setColor(doc, COLORS.cardBg, 'fill');
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(doc, COLORS.dark);
  doc.text('Parámetro de entrada:', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, COLORS.accent);
  doc.text(
    `${MODE_LABELS[mode]}: ${Number(inputValue).toLocaleString('es-MX')}`,
    margin + 5, y + 13
  );

  y += 24;

  // ── Section title ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setColor(doc, COLORS.gold);
  doc.text('Resultados de Producción', margin, y);

  // Gold line under title
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.8);
  doc.line(margin, y + 2, W - margin, y + 2);
  y += 8;

  // ── Result cards grid (2 columns) ────────────────────────────────────────
  const colW = (contentW - 5) / 2;
  const cardH = 22;
  const cardGap = 4;

  RESULT_CARDS.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (colW + 5);
    const cardY = y + row * (cardH + cardGap);

    // Card background
    setColor(doc, COLORS.cardBg, 'fill');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, colW, cardH, 2, 2, 'FD');

    // Left accent stripe
    setColor(doc, COLORS.gold, 'fill');
    doc.rect(x, cardY, 2, cardH, 'F');

    // Icon + label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.medium);
    doc.text(`${card.icon} ${card.label}`, x + 5, cardY + 8);

    // Value
    const val = results[card.key];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setColor(doc, COLORS.dark);
    doc.text(
      val != null ? Number(val).toLocaleString('es-MX') : '—',
      x + 5, cardY + 18
    );

    // Unit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, COLORS.medium);
    doc.text(card.unit, x + colW - 5, cardY + 18, { align: 'right' });
  });

  // ── Reference table ──────────────────────────────────────────────────────
  const tableY = y + Math.ceil(RESULT_CARDS.length / 2) * (cardH + cardGap) + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.gold);
  doc.text('Tabla de Equivalencias', margin, tableY);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.8);
  doc.line(margin, tableY + 2, W - margin, tableY + 2);

  const refs = [
    ['1 tienda', '= 11 cajas  /  110 litros  /  220 botellas'],
    ['1 caja',   '= 10 litros  /  20 botellas'],
    ['1 paquete de cajas', '= 20 cajas'],
    ['1 bolsa de botellas', '= 200 botellas'],
    ['1 rollo de etiquetas', '= 1,000 etiquetas'],
    ['1 paquete de etiquetas', '= 3 rollos  (3,000 etiquetas)'],
    ['1 caja de rollos', '= 9 rollos  (9,000 etiquetas)'],
  ];

  let refY = tableY + 8;
  refs.forEach(([left, right], i) => {
    if (i % 2 === 0) {
      setColor(doc, [248, 243, 220], 'fill');
      doc.rect(margin, refY - 4, contentW, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setColor(doc, COLORS.dark);
    doc.text(left, margin + 3, refY);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.medium);
    doc.text(right, margin + 55, refY);
    refY += 7;
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  setColor(doc, COLORS.gold, 'fill');
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, COLORS.white);
  doc.text(
    'Crystal Vanilla © 2025 — Producción y Logística',
    W / 2, 292, { align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `CrystalVanilla_${mode}_${inputValue}_${Date.now()}.pdf`;
  doc.save(filename);
}
