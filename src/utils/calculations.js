/**
 * Crystal Vanilla — Production Calculator Logic
 *
 * Unidades:
 *   1 tienda           = 11 cajas = 110 litros = 220 botellas
 *   1 caja             = 10 litros = 20 botellas
 *   1 paquete de cajas = 20 cajas
 *   1 paquete charolas = 20 charolas
 *   1 bolsa botellas   = 200 botellas
 *   1 rollo etiquetas  = 1,000 etiquetas
 *   1 paquete etiquetas= 3 rollos = 3,000 etiquetas
 *   1 caja de rollos   = 9 rollos = 9,000 etiquetas
 */

/**
 * Calcula cuántos paquetes se necesitan, el valor exacto,
 * cuántas piezas se usan del último paquete y cuántas sobran.
 */
function pkgInfo(total, perPkg, itemUnit) {
  const exact   = total / perPkg;
  const needed  = Math.ceil(exact);
  const remainder = total % perPkg;
  const usedInLast = remainder === 0 ? perPkg : remainder;
  const leftover   = needed * perPkg - total;
  const isExact    = remainder === 0;
  return { needed, exact, usedInLast, leftover, perPkg, itemUnit, isExact };
}

export function calculate(mode, rawValue) {
  const value = Number(rawValue);
  if (!value || value <= 0) return null;

  let tiendas;

  if (mode === 'litros') {
    tiendas = Math.ceil(value / 110);
  } else if (mode === 'tiendas') {
    tiendas = Math.ceil(value);
  }

  const litrosTotales = tiendas * 110;  // total necesario para tiendas (ceil)

  // ── Análisis de litros (solo modo litros) ─────────────────────
  let litrosFaltantes  = null;
  let litrosSobrantes  = null;
  let tiendasCompletas = null;
  if (mode === 'litros') {
    tiendasCompletas = Math.floor(value / 110);
    litrosFaltantes  = litrosTotales - value;           // ≥ 0 siempre con ceil
    litrosSobrantes  = value - tiendasCompletas * 110;  // 0..109
  }

  // En modo litros las cantidades de producción se basan en tiendasCompletas
  // (lo que realmente se puede producir con los litros disponibles)
  const base         = mode === 'litros' ? tiendasCompletas : tiendas;
  const cajasTotal   = base * 11;
  const botellasTotal = base * 220;

  // Datos de la tienda parcial (modo litros con sobrante > 0)
  let cajasPartial    = null;
  let cajasFaltan     = null;
  let botellasPartial = null;
  let bolsasFaltan    = null;
  if (mode === 'litros' && litrosSobrantes > 0) {
    cajasPartial    = Math.floor(litrosSobrantes / 10);
    cajasFaltan     = 11 - cajasPartial;
    botellasPartial = cajasPartial * 20;
    bolsasFaltan    = 220 - botellasPartial;
  }

  return {
    // ── Simples ────────────────────────────────────────────────
    tiendas,
    litrosTotales,
    cajasTotal,
    botellasTotal,
    litrosFaltantes,
    litrosSobrantes,
    tiendasCompletas,
    cajasPartial,     // cajas disponibles de la tienda parcial (litros mode)
    cajasFaltan,      // cajas que faltan para completar la tienda parcial
    botellasPartial,  // botellas disponibles de la tienda parcial
    bolsasFaltan,     // botellas que faltan para completar la tienda parcial

    // ── Con desglose de paquetes ────────────────────────────────
    paquetesCajas:   pkgInfo(cajasTotal,    20,   'cajas'),
    bolsasBotellas:  pkgInfo(botellasTotal, 200,  'botellas'),
    rollosEtiquetas: pkgInfo(botellasTotal, 1000, 'etiquetas'),
  };
}

/** Estructura de secciones para la UI */
export const SECTIONS = [
  {
    id: 'tiendas',
    title: '🏪 Tiendas',
    color: '#5C3D1E',
    items: [
      { type: 'simple', key: 'tiendas', icon: '🏪', label: 'Tiendas Completas', unit: 'tiendas' },
    ],
  },
  {
    id: 'extracto',
    title: '💧 Extracto',
    color: '#1A5C8B',
    items: [
      { type: 'simple', key: 'litrosTotales', icon: '💧', label: 'Litros de Extracto', unit: 'litros' },
    ],
  },
  {
    id: 'cajas',
    title: '📦 Cajas (Charolas)',
    color: '#8B5E1A',
    items: [
      { type: 'simple', key: 'cajasTotal',    icon: '📦', label: 'Cajas Totales',     unit: 'cajas'   },
      { type: 'pkg',    key: 'paquetesCajas', icon: '📫', label: 'Paquetes de Cajas', unit: 'paquetes',
        desc: '20 cajas (charolas) por paquete' },
    ],
  },
  {
    id: 'botellas',
    title: '🧴 Botellas',
    color: '#1A6B4A',
    items: [
      { type: 'simple', key: 'botellasTotal', icon: '🧴', label: 'Botellas Totales',  unit: 'botellas' },
      { type: 'pkg',    key: 'bolsasBotellas', icon: '🛍️', label: 'Bolsas de Botellas', unit: 'bolsas',
        desc: '200 botellas por bolsa' },
    ],
  },
  {
    id: 'etiquetas',
    title: '🏷️ Etiquetas',
    color: '#6B1A5C',
    items: [
      { type: 'pkg', key: 'rollosEtiquetas', icon: '🏷️', label: 'Rollos de Etiquetas', unit: 'rollos',
        desc: '1,000 etiquetas por rollo' },
    ],
  },
];
