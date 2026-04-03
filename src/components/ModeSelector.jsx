import { motion } from 'framer-motion';

const MODES = [
  {
    id: 'litros',
    emoji: '💧',
    label: 'Tengo litros',
    description: 'Ingresa litros de extracto disponibles',
    placeholder: 'Ej. 1100',
    unit: 'litros',
  },
  {
    id: 'tiendas',
    emoji: '🏪',
    label: 'Necesito tiendas',
    description: 'Ingresa el número de tiendas requeridas',
    placeholder: 'Ej. 26',
    unit: 'tiendas',
  },

];

export default function ModeSelector({ activeMode, onModeChange }) {
  return (
    <motion.div
      className="cv-mode-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <p className="cv-mode-selector__label">Selecciona el modo de cálculo</p>
      <div className="cv-mode-selector__tabs" role="tablist">
        {MODES.map((mode, i) => (
          <motion.button
            key={mode.id}
            role="tab"
            aria-selected={activeMode === mode.id}
            className={`cv-tab ${activeMode === mode.id ? 'cv-tab--active' : ''}`}
            onClick={() => onModeChange(mode.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="cv-tab__emoji">{mode.emoji}</span>
            <span className="cv-tab__label">{mode.label}</span>
            {activeMode === mode.id && (
              <motion.div
                className="cv-tab__indicator"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export { MODES };
