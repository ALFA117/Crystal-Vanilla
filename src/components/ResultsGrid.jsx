import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import Icon from './Icon';

const fmt = (n) => Number(n).toLocaleString('es-MX');

/** Valor exacto del paquete: "5.5" o "11" (entero). */
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

function Status({ tone, icon, children }) {
  return (
    <p className={`cv-status cv-status--${tone}`}>
      <Icon name={icon} size={16} strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}

export default function ResultsGrid({ results, mode, inputValue }) {
  if (!results) return null;

  const isLitros = mode === 'litros';
  // jsPDF se carga solo al pedir el PDF (la página inicial pesa mucho menos)
  const handlePDF = async () => {
    const { exportToPDF } = await import('../utils/pdfExport');
    exportToPDF(results, mode, inputValue);
  };

  const exactLitros = isLitros && results.litrosSobrantes === 0;
  const tiendasShown = isLitros
    ? (exactLitros ? results.tiendas : results.tiendasCompletas)
    : results.tiendas;

  // ── Filas de materiales (mismos datos que la versión anterior) ──
  const rows = [
    {
      key: 'cajasTotal',
      icon: 'box',
      label: 'Cajas totales',
      qty: results.cajasTotal,
      unit: isLitros ? `cajas (${fmt(results.tiendasCompletas)} tiendas)` : 'cajas',
      note: isLitros && results.cajasPartial != null && results.cajasFaltan > 0
        ? `Tienda ${results.tiendas}: tienes ${results.cajasPartial} · faltan ${results.cajasFaltan} cajas`
        : null,
    },
    { key: 'paquetesCajas', icon: 'layers', label: 'Paquetes de cajas', unit: 'paquetes',
      note: '20 cajas (charolas) por paquete', pkg: results.paquetesCajas },
    {
      key: 'botellasTotal',
      icon: 'bottle',
      label: 'Botellas totales',
      qty: results.botellasTotal,
      unit: isLitros ? `botellas (${fmt(results.tiendasCompletas)} tiendas)` : 'botellas',
      note: isLitros && results.botellasPartial != null && results.bolsasFaltan > 0
        ? `Tienda ${results.tiendas}: tienes ${results.botellasPartial} · faltan ${results.bolsasFaltan} botellas`
        : null,
    },
    { key: 'bolsasBotellas', icon: 'bag', label: 'Bolsas de botellas', unit: 'bolsas',
      note: '200 botellas por bolsa', pkg: results.bolsasBotellas },
    { key: 'rollosEtiquetas', icon: 'tag', label: 'Rollos de etiquetas', unit: 'rollos',
      note: '1,000 etiquetas por rollo', pkg: results.rollosEtiquetas },
  ];

  return (
    <motion.div className="cv-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* ── Encabezado ── */}
      <div className="cv-results__head">
        <div>
          <p className="cv-eyebrow">Orden de producción</p>
          <h2 className="cv-results__title">
            {isLitros
              ? <>Para <span className="cv-num">{fmt(inputValue)}</span> litros disponibles</>
              : <>Para surtir <span className="cv-num">{fmt(inputValue)}</span> {Number(inputValue) === 1 ? 'tienda' : 'tiendas'}</>}
          </h2>
        </div>
        <button type="button" className="cv-btn cv-btn--dark" onClick={handlePDF}>
          <Icon name="fileDown" size={18} />
          Descargar PDF
        </button>
      </div>

      <div className="cv-bento">
        {/* ── Tiendas (dato principal) ── */}
        <motion.article className="cv-tile cv-tile--hero" {...block(0)}>
          <header className="cv-tile__head">
            <Icon name="store" size={18} />
            <h3>{isLitros ? 'Tiendas completas' : 'Tiendas'}</h3>
          </header>
          <p className="cv-tile__big"><Counter value={tiendasShown} /></p>
          <p className="cv-tile__unit">tiendas · 110 litros c/u</p>
          {isLitros && (exactLitros ? (
            <Status tone="ok" icon="checkCircle">Litros exactos: no falta ni sobra extracto.</Status>
          ) : (
            <Status tone="warn" icon="alert">
              Faltan {fmt(results.litrosFaltantes)} litros / {Math.ceil(results.litrosFaltantes / 10)} cajas
              para completar {fmt(results.tiendas)} tiendas.
            </Status>
          ))}
        </motion.article>

        {/* ── Extracto ── */}
        <motion.article className="cv-tile cv-tile--ink" {...block(1)}>
          <header className="cv-tile__head">
            <Icon name="droplet" size={18} />
            <h3>Litros de extracto</h3>
          </header>
          <p className="cv-tile__big">
            <Counter value={isLitros ? Number(inputValue) : results.litrosTotales} />
          </p>
          <p className="cv-tile__unit">{isLitros ? 'litros disponibles' : 'litros necesarios'}</p>
          {isLitros && (
            <p className="cv-tile__note">
              {results.litrosFaltantes === 0
                ? `Exacto para ${fmt(results.tiendas)} tiendas`
                : `Necesitas ${fmt(results.litrosTotales)} · faltan ${fmt(results.litrosFaltantes)} litros`}
            </p>
          )}
        </motion.article>

        {/* ── Faltan / sobran (solo modo litros) ── */}
        {isLitros && (
          <>
            <motion.article
              className={`cv-tile cv-tile--half ${results.litrosFaltantes === 0 ? 'cv-tile--ok' : 'cv-tile--warn'}`}
              {...block(2)}
            >
              <header className="cv-tile__head">
                <Icon name={results.litrosFaltantes === 0 ? 'checkCircle' : 'minusCircle'} size={18} />
                <h3>
                  {results.litrosFaltantes === 0
                    ? 'Litros exactos'
                    : `Para completar ${fmt(results.tiendas)} tiendas te faltan`}
                </h3>
              </header>
              <p className="cv-tile__mid">{fmt(results.litrosFaltantes)} <span>litros</span></p>
              {results.litrosFaltantes > 0 && (
                <p className="cv-tile__note">
                  Tienes {fmt(inputValue)}, necesitas {fmt(results.litrosTotales)}.
                </p>
              )}
            </motion.article>

            <motion.article
              className={`cv-tile cv-tile--half ${results.litrosSobrantes === 0 ? 'cv-tile--ok' : 'cv-tile--neutral'}`}
              {...block(3)}
            >
              <header className="cv-tile__head">
                <Icon name={results.litrosSobrantes === 0 ? 'checkCircle' : 'plusCircle'} size={18} />
                <h3>
                  {results.litrosSobrantes === 0
                    ? 'Sin excedente'
                    : `Sobran con ${fmt(results.tiendasCompletas)} tiendas`}
                </h3>
              </header>
              <p className="cv-tile__mid">{fmt(results.litrosSobrantes)} <span>litros</span></p>
              {results.litrosSobrantes > 0 && (
                <p className="cv-tile__note">
                  {fmt(results.tiendasCompletas)} tiendas completas usan {fmt(results.tiendasCompletas * 110)} litros.
                </p>
              )}
            </motion.article>
          </>
        )}

        {/* ── Materiales ── */}
        <motion.article className="cv-tile cv-tile--full cv-materials" {...block(4)}>
          <header className="cv-tile__head cv-materials__head">
            <Icon name="list" size={18} />
            <h3>Materiales</h3>
            <span className="cv-materials__hint">Paquetes redondeados hacia arriba</span>
          </header>

          <table className="cv-table">
            <thead>
              <tr>
                <th scope="col">Concepto</th>
                <th scope="col" className="is-num">Cantidad</th>
                <th scope="col" className="is-num">Exacto</th>
                <th scope="col" className="is-num">Usas del último</th>
                <th scope="col" className="is-num">Sobran</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = r.pkg;
                return (
                  <tr key={r.key} className={p ? 'is-pkg' : 'is-total'}>
                    <th scope="row">
                      <span className="cv-table__concept">
                        <span className="cv-table__icon"><Icon name={r.icon} size={17} /></span>
                        <span>
                          <span className="cv-table__label">{r.label}</span>
                          {r.note && <span className={`cv-table__note ${p ? '' : 'is-warn'}`}>{r.note}</span>}
                        </span>
                      </span>
                    </th>
                    <td className="is-num" data-label="Cantidad">
                      <span className="cv-cell">
                        <strong className="cv-table__qty">{fmt(p ? p.needed : r.qty)}</strong>
                        <span className="cv-table__unit">{r.unit}</span>
                      </span>
                    </td>
                    <td className={`is-num ${p ? '' : 'is-na'}`} data-label="Exacto">
                      {p ? (
                        <span className="cv-cell">
                          {p.isExact
                            ? <span className="cv-exact"><Icon name="check" size={14} strokeWidth={2.5} title="Exacto" /> {fmtExact(p.exact)}</span>
                            : <span>{fmtExact(p.exact)}</span>}
                          <span className="cv-table__unit">{p.isExact ? 'exacto' : r.unit}</span>
                        </span>
                      ) : <span className="cv-na" aria-label="No aplica">—</span>}
                    </td>
                    <td className={`is-num ${p && !p.isExact ? '' : 'is-na'}`} data-label="Usas del último">
                      {p && !p.isExact ? (
                        <span className="cv-cell">
                          <span className="cv-good">{fmt(p.usedInLast)}</span>
                          <span className="cv-table__unit">{p.itemUnit}</span>
                        </span>
                      ) : <span className="cv-na" aria-label="No aplica">—</span>}
                    </td>
                    <td className={`is-num ${p && !p.isExact ? '' : 'is-na'}`} data-label="Sobran">
                      {p && !p.isExact ? (
                        <span className="cv-cell">
                          <span className="cv-left">{fmt(p.leftover)}</span>
                          <span className="cv-table__unit">{p.itemUnit}</span>
                        </span>
                      ) : <span className="cv-na" aria-label="No aplica">—</span>}
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
