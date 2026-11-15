import { motion } from 'framer-motion';
import Icon from './Icon';

const MODES = [
  {
    id: 'litros',
    icon: 'droplet',
    label: 'Tengo litros',
    hint: 'Litros → tiendas',
    description: 'Litros de extracto disponibles',
    placeholder: 'Ej. 1100',
    unit: 'litros',
  },
  {
    id: 'tiendas',
    icon: 'store',
    label: 'Necesito tiendas',
    hint: 'Tiendas → litros',
    description: 'Número de tiendas a surtir',
    placeholder: 'Ej. 26',
    unit: 'tiendas',
  },
];

export default function ModeSelector({ activeMode, onModeChange }) {
  return (
    <div className="cv-mode">
      <p id="cv-mode-label" className="cv-label">1 · ¿Qué dato tienes?</p>
      <div className="cv-mode__tabs" role="radiogroup" aria-labelledby="cv-mode-label">
        {MODES.map((mode) => {
          const active = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`cv-mode__tab ${active ? 'is-active' : ''}`}
              onClick={() => onModeChange(mode.id)}
            >
              {active && (
                <motion.span
                  className="cv-mode__pill"
                  layoutId="cv-mode-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className="cv-mode__icon"><Icon name={mode.icon} size={18} /></span>
              <span className="cv-mode__text">
                <span className="cv-mode__name">{mode.label}</span>
                <span className="cv-mode__hint">{mode.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MODES };
