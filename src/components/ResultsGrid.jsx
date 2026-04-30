import { motion, AnimatePresence } from 'framer-motion';
import { SimpleCard, PkgCard } from './ResultCard';
import { SECTIONS } from '../utils/calculations';
import { exportToPDF } from '../utils/pdfExport';

const SECTION_COLORS = {
  tiendas:  '#D4A017',
  extracto: '#2980B9',
  cajas:    '#E8A020',
  charolas: '#8B6914',
  botellas: '#27AE60',
  etiquetas:'#8E44AD',
};

export default function ResultsGrid({ results, mode, inputValue, onInventario }) {
  if (!results) return null;

  const handlePDF = () => exportToPDF(results, mode, inputValue);

  let cardGlobalIndex = 0;

  return (
    <AnimatePresence>
      <motion.section
        className="cv-results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        aria-label="Resultados de producción"
      >
        {/* ── Top bar ── */}
        <motion.div
          className="cv-results__header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="cv-results__title">
            <span className="cv-results__title-decor">✦</span>
            &nbsp; Resultados de Producción &nbsp;
            <span className="cv-results__title-decor">✦</span>
          </h2>

          <div className="cv-results__actions">
            <motion.button
              className="cv-btn-pdf"
              onClick={handlePDF}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(212,160,23,0.45)' }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              📄 Descargar PDF
            </motion.button>

            <motion.button
              className="cv-btn-inventario"
              onClick={onInventario}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(212,160,23,0.3)' }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              📋 Inventario
            </motion.button>
          </div>
        </motion.div>

        {/* ── Sections ── */}
        {SECTIONS.map((section, sIdx) => {
          const accentColor = SECTION_COLORS[section.id] || '#D4A017';

          return (
            <motion.div
              key={section.id}
              className="cv-section"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: sIdx * 0.08 }}
            >
              {/* Section title */}
              <div className="cv-section__header" style={{ '--sec-color': accentColor }}>
                <h3 className="cv-section__title">{section.title}</h3>
                <div  className="cv-section__line" />
              </div>

              {/* Cards — incluyendo litros info en extracto */}
              <div className="cv-section__grid">
                {section.items.map((item) => {
                  const idx = cardGlobalIndex++;
                  if (item.type === 'simple') {
                    // En modo litros, la tarjeta de tiendas la maneja la tarjeta especial de litros
                    if (mode === 'litros' && section.id === 'tiendas' && item.key === 'tiendas') return null;
                    return (
                      <SimpleCard
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        unit={item.unit}
                        value={results[item.key]}
                        index={idx}
                        accentColor={accentColor}
                      />
                    );
                  }
                  return (
                    <PkgCard
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      unit={item.unit}
                      desc={item.desc}
                      pkgData={results[item.key]}
                      index={idx}
                      accentColor={accentColor}
                    />
                  );
                })}

                {/* ── Tarjeta tiendas completas (en sección Tiendas, solo modo litros) ── */}
                {section.id === 'tiendas' && mode === 'litros' && results.litrosFaltantes != null && (
                  <>
                    {results.litrosSobrantes === 0 ? (
                      <motion.div
                        className="cv-litros-card cv-litros-card--ok cv-litros-card--exact"
                        initial={{ opacity: 0, scale: 0.85, y: 16 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                      >
                        <span className="cv-litros-card__badge">✓</span>
                        <p className="cv-litros-card__label">Tiendas Completas</p>
                        <span className="cv-litros-card__label-num">{results.tiendas}</span>
                        <span className="cv-litros-card__unit">tiendas</span>
                        <p className="cv-litros-card__sub">Litros exactos</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="cv-litros-card cv-litros-card--ok"
                        initial={{ opacity: 0, scale: 0.85, y: 16 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                      >
                        <span className="cv-litros-card__badge">🏪</span>
                        <p className="cv-litros-card__label">Tiendas Completas</p>
                        <span className="cv-litros-card__label-num">{results.tiendasCompletas}</span>
                        <span className="cv-litros-card__unit">tiendas</span>
                        <p className="cv-litros-card__sub">
                          Faltan {results.litrosFaltantes.toLocaleString('es-MX')} litros
                          / {Math.ceil(results.litrosFaltantes / 10)} charolas
                          para completar {results.tiendas} tiendas
                        </p>
                      </motion.div>
                    )}
                  </>
                )}

                {/* ── Tarjetas litros faltantes/sobrantes (en sección Extracto) ── */}
                {section.id === 'extracto' && mode === 'litros' && results.litrosFaltantes != null && (
                  <>
                    {/* Tarjeta: FALTAN */}
                    <motion.div
                      className={`cv-litros-card cv-litros-card--warn ${results.litrosFaltantes === 0 ? 'cv-litros-card--exact' : ''}`}
                      initial={{ opacity: 0, scale: 0.85, y: 16 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                    >
                      <span className="cv-litros-card__badge">
                        {results.litrosFaltantes === 0 ? '✓' : '!'}
                      </span>
                      {results.litrosFaltantes === 0 ? (
                        <p className="cv-litros-card__label">Litros exactos</p>
                      ) : (
                        <>
                          <p className="cv-litros-card__label">Para completar</p>
                          <span className="cv-litros-card__label-num">{results.tiendas}</span>
                          <p className="cv-litros-card__label">tiendas te faltan</p>
                        </>
                      )}
                      <span className="cv-litros-card__number">
                        {results.litrosFaltantes.toLocaleString('es-MX')}
                      </span>
                      <span className="cv-litros-card__unit">litros</span>
                      {results.litrosFaltantes > 0 && (
                        <p className="cv-litros-card__sub">
                          Tienes {Number(inputValue).toLocaleString('es-MX')},<br />
                          necesitas {results.litrosTotales.toLocaleString('es-MX')}
                        </p>
                      )}
                    </motion.div>

                    {/* Tarjeta: SOBRAN */}
                    <motion.div
                      className={`cv-litros-card cv-litros-card--ok ${results.litrosSobrantes === 0 ? 'cv-litros-card--exact' : ''}`}
                      initial={{ opacity: 0, scale: 0.85, y: 16 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.25 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                    >
                      <span className="cv-litros-card__badge">
                        {results.litrosSobrantes === 0 ? '✓' : '+'}
                      </span>
                      {results.litrosSobrantes === 0 ? (
                        <p className="cv-litros-card__label">Sin excedente</p>
                      ) : (
                        <>
                          <p className="cv-litros-card__label">Sobran con</p>
                          <span className="cv-litros-card__label-num">{results.tiendasCompletas}</span>
                          <p className="cv-litros-card__label">tiendas</p>
                        </>
                      )}
                      <span className="cv-litros-card__number">
                        {results.litrosSobrantes.toLocaleString('es-MX')}
                      </span>
                      <span className="cv-litros-card__unit">litros</span>
                      {results.litrosSobrantes > 0 && (
                        <p className="cv-litros-card__sub">
                          {results.tiendasCompletas} tiendas completas<br />
                          usan {(results.tiendasCompletas * 110).toLocaleString('es-MX')} litros
                        </p>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ── Reference table ── */}
        <motion.div
          className="cv-reference"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <h3 className="cv-reference__title">📐 Tabla de Equivalencias</h3>
          <div className="cv-reference__grid">
            {[
              ['1 tienda',              '11 cajas · 110 litros · 220 botellas'],
              ['1 caja',                '10 litros · 20 botellas'],
              ['1 paquete de cajas',    '20 cajas (= charolas, es lo mismo)'],
              ['1 bolsa de botellas',   '200 botellas'],
              ['1 rollo de etiquetas',  '1,000 etiquetas'],
            ].map(([left, right]) => (
              <div key={left} className="cv-reference__row">
                <span className="cv-reference__key">{left}</span>
                <span className="cv-reference__val">= {right}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}
