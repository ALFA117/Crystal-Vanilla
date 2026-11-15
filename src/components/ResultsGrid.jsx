import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import Icon from './Icon';

const fmt = (n) => Number(n).toLocaleString('es-MX');

/** Valor exacto del paquete: "4.95" o "11" (entero). */
function fmtExact(exact) {
  const rounded = parseFloat(exact.toFixed(4));
  if (Number.isInteger(rounded)) return rounded.toLocaleString('es-MX');
  return parseFloat(exact.toFixed(3)).toLocaleString('es-MX', { maximumFractionDigits: 3 });
}

function Counter({ value }) {
  const animated = useAnimatedCounter(value, 700);
  return <>{fmt(animated)}</>;
}

const block = (i) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: 0.04 * i, ease: 'easeOut' },
});

const plural = (n, uno, varios) => (Number(n) === 1 ? uno : varios);

export default function ResultsGrid({ results, mode, inputValue, stale = false }) {
  if (!results) return null;

  const isLitros = mode === 'litros';
  // jsPDF se carga solo al pedir el PDF (la página inicial pesa mucho menos)
  const handlePDF = async () => {
    const { exportToPDF } = await import('../utils/pdfExport');
    exportToPDF(results, mode, inputValue);
  };

  const exactLitros = isLitros && results.litrosSobrantes === 0;
  // Tiendas que realmente se surten: en modo litros, solo las completas.
  const tiendasBase = isLitros ? results.tiendasCompletas : results.tiendas;
  const siguiente = results.tiendas; // número de la tienda incompleta (modo litros)

  // ── Materiales: una fila por material, con su empaque ──
  const rows = [
    { key: 'cajas',     icon: 'box',    label: 'Cajas (charolas)', pkgNote: '20 cajas por paquete',
      total: results.cajasTotal,    unit: 'cajas',     pkg: results.paquetesCajas,   pkgUnit: ['paquete', 'paquetes'] },
    { key: 'botellas',  icon: 'bottle', label: 'Botellas',         pkgNote: '200 botellas por bolsa',
      total: results.botellasTotal, unit: 'botellas',  pkg: results.bolsasBotellas,  pkgUnit: ['bolsa', 'bolsas'] },
    { key: 'etiquetas', icon: 'tag',    label: 'Etiquetas',        pkgNote: '1,000 etiquetas por rollo',
      total: results.botellasTotal, unit: 'etiquetas', pkg: results.rollosEtiquetas, pkgUnit: ['rollo', 'rollos'] },
  ];

  return (
    <motion.div
      className={`cv-results ${stale ? 'is-stale' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Encabezado ── */}
      <div className="cv-results__head">
        <div>
          <p className="cv-eyebrow">Orden de producción</p>
          <h2 className="cv-results__title">
            {isLitros
              ? <>{fmt(inputValue)} litros disponibles</>
              : <>Surtir {fmt(inputValue)} {plural(inputValue, 'tienda', 'tiendas')}</>}
          </h2>
        </div>
        <button type="button" className="cv-btn cv-btn--dark" onClick={handlePDF}>
          <Icon name="fileDown" size={18} />
          Descargar PDF
        </button>
      </div>

      {stale && (
        <p className="cv-stale" role="status">
          <Icon name="info" size={16} />
          <span>
            Este resultado es de {fmt(inputValue)} {isLitros ? 'litros' : plural(inputValue, 'tienda', 'tiendas')}.
            Cambiaste el dato: pulsa <strong>Calcular producción</strong> para actualizarlo.
          </span>
        </p>
      )}

      <div className="cv-bento">
        {/* ── Tiendas (dato principal) ── */}
        <motion.article className="cv-tile cv-tile--hero" {...block(0)}>
          <header className="cv-tile__head">
            <Icon name="store" size={18} />
            <h3>{isLitros ? 'Tiendas completas' : 'Tiendas a surtir'}</h3>
          </header>
          <p className="cv-tile__big"><Counter value={tiendasBase} /></p>
          <p className="cv-tile__unit">
            {plural(tiendasBase, 'tienda', 'tiendas')} de 110 litros · 11 cajas · 220 botellas c/u
          </p>
          {exactLitros && (
            <p className="cv-status cv-status--ok">
              <Icon name="checkCircle" size={16} strokeWidth={2} />
              <span>Litros exactos: no sobra ni falta extracto.</span>
            </p>
          )}
        </motion.article>

        {/* ── Extracto ── */}
        <motion.article className="cv-tile cv-tile--ink" {...block(1)}>
          <header className="cv-tile__head">
            <Icon name="droplet" size={18} />
            <h3>Extracto</h3>
          </header>
          <p className="cv-tile__big">
            <Counter value={isLitros ? Number(inputValue) : results.litrosTotales} />
          </p>
          <p className="cv-tile__unit">{isLitros ? 'litros disponibles' : 'litros necesarios'}</p>
          {isLitros && !exactLitros && (
            <p className="cv-tile__note">
              {fmt(results.tiendasCompletas * 110)} litros se usan en las tiendas completas.
            </p>
          )}
        </motion.article>

        {/* ── Balance (solo si los litros no cierran en tiendas completas) ── */}
        {isLitros && !exactLitros && (
          <motion.article className="cv-tile cv-tile--full cv-balance" {...block(2)}>
            <header className="cv-tile__head">
              <Icon name="ruler" size={18} />
              <h3>Balance de extracto</h3>
            </header>
            <div className="cv-balance__grid">
              <div className="cv-balance__item">
                <p className="cv-balance__label">
                  Sobrante tras {fmt(results.tiendasCompletas)} {plural(results.tiendasCompletas, 'tienda', 'tiendas')}
                </p>
                <p className="cv-balance__value">{fmt(results.litrosSobrantes)} <span>litros</span></p>
                <p className="cv-balance__note">
                  {results.cajasPartial > 0
                    ? `Alcanza para ${results.cajasPartial} de las 11 cajas de la tienda ${siguiente}.`
                    : 'No alcanza para una caja completa de 10 litros.'}
                </p>
              </div>
              <div className="cv-balance__item cv-balance__item--warn">
                <p className="cv-balance__label">
                  <Icon name="alert" size={16} strokeWidth={2} />
                  Faltan para completar la tienda {siguiente}
                </p>
                <p className="cv-balance__value">{fmt(results.litrosFaltantes)} <span>litros</span></p>
                <p className="cv-balance__note">
                  Equivale a {results.cajasFaltan} {plural(results.cajasFaltan, 'caja', 'cajas')} de 10 litros.
                </p>
              </div>
            </div>
          </motion.article>
        )}

        {/* ── Materiales ── */}
        <motion.article className="cv-tile cv-tile--full cv-materials" {...block(3)}>
          <header className="cv-tile__head cv-materials__head">
            <Icon name="list" size={18} />
            <h3>Materiales</h3>
            <span className="cv-materials__hint">
              Para {fmt(tiendasBase)} {plural(tiendasBase, 'tienda completa', 'tiendas completas')} · empaques redondeados hacia arriba
            </span>
          </header>

          <table className="cv-table">
            <colgroup>
              <col className="cv-col--concept" />
              <col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Material</th>
                <th scope="col" className="is-num">Piezas</th>
                <th scope="col" className="is-num">Empaques</th>
                <th scope="col" className="is-num">Del último</th>
                <th scope="col" className="is-num">Sobrante</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = r.pkg;
                const [uno, varios] = r.pkgUnit;
                return (
                  <tr key={r.key}>
                    <th scope="row">
                      <span className="cv-table__concept">
                        <span className="cv-table__icon"><Icon name={r.icon} size={17} /></span>
                        <span>
                          <span className="cv-table__label">{r.label}</span>
                          <span className="cv-table__note">{r.pkgNote}</span>
                        </span>
                      </span>
                    </th>
                    <td className="is-num" data-label="Piezas">
                      <span className="cv-cell">
                        <span className="cv-table__val">{fmt(r.total)}</span>
                        <span className="cv-table__unit">{r.unit}</span>
                      </span>
                    </td>
                    <td className="is-num" data-label="Empaques">
                      <span className="cv-cell">
                        <strong className="cv-table__qty">{fmt(p.needed)}</strong>
                        <span className="cv-table__unit">
                          {plural(p.needed, uno, varios)}
                          {p.isExact
                            ? <span className="cv-exact"> · exacto</span>
                            : <> · {fmtExact(p.exact)} exactos</>}
                        </span>
                      </span>
                    </td>
                    <td className="is-num" data-label="Del último">
                      <span className="cv-cell">
                        <span className="cv-table__val">{fmt(p.usedInLast)}</span>
                        <span className="cv-table__unit">de {fmt(p.perPkg)} {r.unit}</span>
                      </span>
                    </td>
                    <td className="is-num" data-label="Sobrante">
                      <span className="cv-cell">
                        {p.leftover === 0
                          ? <span className="cv-table__none">Ninguno</span>
                          : <>
                              <span className="cv-table__val">{fmt(p.leftover)}</span>
                              <span className="cv-table__unit">{r.unit}</span>
                            </>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.article>
      </div>
    </motion.div>
  );
}
