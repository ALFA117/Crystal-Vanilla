import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const CARD_COLORS = [
  { bg: '#FFFDE7', accent: '#F5C842' },
  { bg: '#FFF8E1', accent: '#E8A020' },
  { bg: '#FFFDF0', accent: '#D4A017' },
  { bg: '#FFF9E6', accent: '#F0B429' },
  { bg: '#FFFDE7', accent: '#F5C842' },
  { bg: '#FFF8E1', accent: '#E8A020' },
  { bg: '#FFFDF0', accent: '#D4A017' },
  { bg: '#FFF9E6', accent: '#F0B429' },
  { bg: '#FFFDE7', accent: '#F5C842' },
  { bg: '#FFF8E1', accent: '#E8A020' },
];

export default function ResultCard({ icon, label, unit, value, index }) {
  const animated = useAnimatedCounter(value, 900);

  return (
    <motion.div
      className="cv-result-card"
      style={{
        '--card-bg':     CARD_COLORS[index % CARD_COLORS.length].bg,
        '--card-accent': CARD_COLORS[index % CARD_COLORS.length].accent,
      }}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 22,
        delay: index * 0.07,
      }}
      whileHover={{
        scale: 1.04,
        y: -4,
        boxShadow: '0 12px 32px rgba(212,160,23,0.35)',
        transition: { duration: 0.2 },
      }}
      layout
    >
      <motion.span
        className="cv-result-card__icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: index * 0.07 + 0.15 }}
      >
        {icon}
      </motion.span>

      <p className="cv-result-card__label">{label}</p>

      <div className="cv-result-card__value-row">
        <motion.span
          className="cv-result-card__number"
          key={value}
          initial={{ scale: 1.3, color: '#E8A020' }}
          animate={{ scale: 1, color: '#3B2A1A' }}
          transition={{ duration: 0.4 }}
        >
          {animated.toLocaleString('es-MX')}
        </motion.span>
      </div>

      <span className="cv-result-card__unit">{unit}</span>

      {/* Bottom accent bar */}
      <div className="cv-result-card__bar" />
    </motion.div>
  );
}
