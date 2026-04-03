import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from './ResultCard';
import { RESULT_CARDS } from '../utils/calculations';
import { exportToPDF } from '../utils/pdfExport';

export default function ResultsGrid({ results, mode, inputValue }) {
  if (!results) return null;

  const handlePDF = () => {
    exportToPDF(results, mode, inputValue);
  };

  return (
    <AnimatePresence>
      <motion.section
        className="cv-results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        aria-label="Resultados de producción"
      >
        {/* Section header */}
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

        {/* Cards grid */}
        <div className="cv-results__grid">
          {RESULT_CARDS.map((card, i) => (
            <ResultCard
              key={`${card.key}-${results[card.key]}`}
              icon={card.icon}
              label={card.label}
              unit={card.unit}
              value={results[card.key]}
              index={i}
            />
          ))}
        </div>

        {/* Reference info */}
        <motion.div
          className="cv-reference"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h3 className="cv-reference__title">📐 Tabla de Equivalencias</h3>
          <div className="cv-reference__grid">
            {[
              ['1 tienda', '11 cajas · 110 litros · 220 botellas'],
              ['1 caja', '10 litros · 20 botellas'],
              ['1 paquete de cajas', '20 cajas'],
              ['1 bolsa de botellas', '200 botellas'],
              ['1 rollo de etiquetas', '1,000 etiquetas'],
              ['1 paquete de etiquetas', '3 rollos = 3,000 etiquetas'],
              ['1 caja de rollos', '9 rollos = 9,000 etiquetas'],
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
