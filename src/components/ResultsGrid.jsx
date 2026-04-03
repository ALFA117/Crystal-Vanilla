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

export default function ResultsGrid({ results, mode, inputValue }) {
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

              {/* Cards */}
              <div className="cv-section__grid">
                {section.items.map((item) => {
                  const idx = cardGlobalIndex++;
                  if (item.type === 'simple') {
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
              ['1 paquete etiquetas',   '3 rollos = 3,000 etiquetas'],
              ['1 caja de rollos',      '9 rollos = 9,000 etiquetas'],
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
