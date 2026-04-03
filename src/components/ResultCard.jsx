import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

/** Formatea el decimal exacto: "12.1", "12" → "12 ✓ exacto" */
function fmtExact(exact) {
  const rounded = parseFloat(exact.toFixed(4));
  const isWhole = Number.isInteger(rounded);
  if (isWhole) return `${rounded.toLocaleString('es-MX')} ✓`;
  return parseFloat(exact.toFixed(3)).toLocaleString('es-MX', {
    maximumFractionDigits: 3,
  });
}

// ── Simple card (tiendas, litros, cajas totales, etc.) ──────────────────────
export function SimpleCard({ icon, label, unit, value, index, accentColor }) {
  const animated = useAnimatedCounter(value, 900);

  return (
    <motion.div
      className="cv-card cv-card--simple"
      style={{ '--card-accent': accentColor }}
      initial={{ opacity: 0, scale: 0.75, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.06 }}
      whileHover={{ scale: 1.04, y: -3, boxShadow: '0 10px 28px rgba(212,160,23,0.3)' }}
    >
      <span className="cv-card__icon">{icon}</span>
      <p   className="cv-card__label">{label}</p>
      <motion.span
        className="cv-card__number"
        key={value}
        initial={{ scale: 1.25, color: '#E8A020' }}
        animate={{ scale: 1,    color: '#3B2A1A' }}
        transition={{ duration: 0.35 }}
      >
        {animated.toLocaleString('es-MX')}
      </motion.span>
      <span className="cv-card__unit">{unit}</span>
      <div  className="cv-card__bar" />
    </motion.div>
  );
}

// ── Package card (paquetes, bolsas, rollos) — con desglose ─────────────────
export function PkgCard({ icon, label, unit, desc, pkgData, index, accentColor }) {
  const { needed, exact, usedInLast, leftover, itemUnit, isExact } = pkgData;
  const animated = useAnimatedCounter(needed, 900);

  return (
    <motion.div
      className="cv-card cv-card--pkg"
      style={{ '--card-accent': accentColor }}
      initial={{ opacity: 0, scale: 0.75, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.06 }}
      whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 28px rgba(212,160,23,0.3)' }}
    >
      <span className="cv-card__icon">{icon}</span>
      <p    className="cv-card__label">{label}</p>

      <motion.span
        className="cv-card__number"
        key={needed}
        initial={{ scale: 1.25, color: '#E8A020' }}
        animate={{ scale: 1,    color: '#3B2A1A' }}
        transition={{ duration: 0.35 }}
      >
        {animated.toLocaleString('es-MX')}
      </motion.span>
      <span className="cv-card__unit">{unit}</span>

      {desc && <span className="cv-card__desc">{desc}</span>}

      {/* ── Desglose ── */}
      <div className="cv-card__breakdown">
        <div className="cv-card__breakdown-row cv-card__breakdown-row--exact">
          <span className="cv-card__bd-label">Exacto</span>
          <span className="cv-card__bd-val">
            {fmtExact(exact)} {isExact ? '' : unit}
          </span>
        </div>

        {!isExact && (
          <>
            <div className="cv-card__breakdown-row cv-card__breakdown-row--used">
              <span className="cv-card__bd-label">Usas del último</span>
              <span className="cv-card__bd-val cv-card__bd-val--used">
                {usedInLast.toLocaleString('es-MX')} {itemUnit}
              </span>
            </div>
            <div className="cv-card__breakdown-row cv-card__breakdown-row--left">
              <span className="cv-card__bd-label">Sobran</span>
              <span className="cv-card__bd-val cv-card__bd-val--left">
                {leftover.toLocaleString('es-MX')} {itemUnit}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="cv-card__bar" />
    </motion.div>
  );
}
