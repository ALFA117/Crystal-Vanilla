/**
 * Crystal Vanilla — Production Calculator Logic
 * Units:
 *   1 tienda = 11 cajas = 110 litros = 220 botellas
 *   1 caja   = 10 litros = 20 botellas
 *   1 paquete de cajas  = 20 cajas
 *   1 bolsa de botellas = 200 botellas
 *   1 charola           = 1 tienda armada
 *   1 rollo etiquetas   = 1,000 etiquetas (1 botella = 1 etiqueta)
 *   1 paquete etiquetas = 3 rollos = 3,000 etiquetas
 *   1 caja de rollos    = 9 rollos = 9,000 etiquetas
 */

export function calculate(mode, rawValue) {
  const value = Number(rawValue);
  if (!value || value <= 0) return null;

  let tiendas;

  if (mode === 'litros') {
    tiendas = Math.ceil(value / 110);
  } else if (mode === 'tiendas') {
    tiendas = Math.ceil(value);
  } else if (mode === 'bolsas') {
    // Each bolsa has 200 bottles; need 220 bottles per complete tienda
    tiendas = Math.floor((value * 200) / 220);
    if (tiendas <= 0) tiendas = 0;
  }

  const litrosTotales    = tiendas * 110;
  const botellasTotal    = tiendas * 220;
  const cajasTotal       = tiendas * 11;
  const paquetesCajas    = Math.ceil(cajasTotal  / 20);
  const bolsasBotellas   = Math.ceil(botellasTotal / 200);
  const charolas         = tiendas;
  const rollosEtiquetas  = Math.ceil(botellasTotal / 1000);
  const paquetesEtiquetas= Math.ceil(botellasTotal / 3000);
  const cajasRollos      = Math.ceil(botellasTotal / 9000);

  return {
    tiendas,
    cajasTotal,
    botellasTotal,
    litrosTotales,
    paquetesCajas,
    bolsasBotellas,
    charolas,
    rollosEtiquetas,
    paquetesEtiquetas,
    cajasRollos,
  };
}

export const RESULT_CARDS = [
  { key: 'tiendas',          icon: '🏪', label: 'Tiendas Completas',             unit: 'tiendas' },
  { key: 'cajasTotal',       icon: '📦', label: 'Cajas Totales',                 unit: 'cajas'   },
  { key: 'botellasTotal',    icon: '🧴', label: 'Botellas Totales',              unit: 'botellas'},
  { key: 'litrosTotales',    icon: '💧', label: 'Litros de Extracto',            unit: 'litros'  },
  { key: 'paquetesCajas',    icon: '📫', label: 'Paquetes de Cajas',             unit: 'paquetes'},
  { key: 'bolsasBotellas',   icon: '🛍️', label: 'Bolsas de Botellas',            unit: 'bolsas'  },
  { key: 'charolas',         icon: '🗂️', label: 'Charolas a Armar',              unit: 'charolas'},
  { key: 'rollosEtiquetas',  icon: '🏷️', label: 'Rollos de Etiquetas',           unit: 'rollos'  },
  { key: 'paquetesEtiquetas',icon: '📦', label: 'Paquetes de Etiquetas (×3)',    unit: 'paquetes'},
  { key: 'cajasRollos',      icon: '🗃️', label: 'Cajas de Rollos (×9)',          unit: 'cajas'   },
];
