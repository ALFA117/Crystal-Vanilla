import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="cv-header">
      <motion.div
        className="cv-header__inner"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.span
          className="cv-header__icon"
          animate={{
            rotate: [0, 8, -8, 8, 0],
            scale:  [1, 1.1, 1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌿
        </motion.span>

        <div className="cv-header__text">
          <h1 className="cv-header__title">Crystal Vanilla</h1>
          <p className="cv-header__subtitle">Calculadora de Producción</p>
        </div>

        <motion.span
          className="cv-header__icon cv-header__icon--right"
          animate={{
            rotate: [0, -8, 8, -8, 0],
            scale:  [1, 1.05, 1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🌿
        </motion.span>
      </motion.div>

      {/* Decorative golden divider */}
      <motion.div
        className="cv-header__divider"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
      />
    </header>
  );
}
