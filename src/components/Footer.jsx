import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      className="cv-footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="cv-footer__divider">
        <span className="cv-footer__ornament">✦</span>
        <span className="cv-footer__ornament">✦</span>
        <span className="cv-footer__ornament">✦</span>
      </div>
      <p className="cv-footer__text">
        Crystal Vanilla <span className="cv-footer__copy">©</span> 2025 — Producción y Logística
      </p>
      <p className="cv-footer__sub">🌿 Todos los cálculos usan redondeo hacia arriba (Math.ceil)</p>
    </motion.footer>
  );
}
