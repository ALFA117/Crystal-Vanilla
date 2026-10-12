import { motion } from 'framer-motion';
import { Glyph, withGlyph } from './Glyph';

const FIELDS = [
  { id: 'bolsas_botellas', label: 'Bolsas de Botellas',  placeholder: '0', icon: '🛍️' },
  { id: 'cajas_tapas',     label: 'Cajas de Tapas',      placeholder: '0', icon: '🔩' },
  { id: 'cajas_charolas',  label: 'Cajas de Charolas',   placeholder: '0', icon: '📦' },
];

export default function Inventario() {
  return (
    <motion.div
      className="cv-inventario"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="cv-inventario__header">
        <h2 className="cv-inventario__title"><Glyph i="📋" /> Inventario</h2>
        <p className="cv-inventario__subtitle">Existencias actuales</p>
      </div>

      {/* Fields */}
      <div className="cv-inventario__body">
        {FIELDS.map((field) => (
          <div key={field.id} className="cv-inventario__field">
            <label className="cv-inventario__label">
              <Glyph i={field.icon} /> {withGlyph(field.label)}
            </label>
            <input
              className="cv-inventario__input"
              type="number"
              placeholder={field.placeholder}
              aria-label={field.label}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
