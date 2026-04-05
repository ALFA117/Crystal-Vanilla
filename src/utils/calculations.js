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

  const litrosTotales = tiendas * 110;
  const botellasTotal = tiendas * 220;
  const cajasTotal    = tiendas * 11;

  // ── Análisis de litros (solo modo litros) ─────────────────────
  // litrosFaltantes: cuántos litros más se necesitan para la última tienda
  // litrosSobrantes: cuántos litros quedan si solo haces tiendas completas
  // Nota: litrosFaltantes + litrosSobrantes = 110 (a menos que sea exacto)
  let litrosFaltantes = null;
  let litrosSobrantes = null;
  let tiendasCompletas = null;
  if (mode === 'litros') {
    litrosFaltantes  = litrosTotales - value;            // ≥ 0 siempre con ceil
    tiendasCompletas = Math.floor(value / 110);
    litrosSobrantes  = value - tiendasCompletas * 110;   // 0..109
  }

  return {
    // ── Simples ────────────────────────────────────────────────
    tiendas,
    litrosTotales,
    cajasTotal,
    botellasTotal,
    litrosFaltantes,    // null | 0 (exacto) | >0 (faltan litros)
    litrosSobrantes,    // null | 0 (exacto) | >0 (litros que sobran)
    tiendasCompletas,   // null | number

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
