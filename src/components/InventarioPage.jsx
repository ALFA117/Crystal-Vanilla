import { motion } from 'framer-motion';

const FIELDS = [
  { id: 'bolsas_botellas', label: 'Bolsas de Botellas', placeholder: '0', icon: '🛍️' },
  { id: 'cajas_tapas',     label: 'Cajas de Tapas',     placeholder: '0', icon: '🔩' },
  { id: 'cajas_charolas',  label: 'Cajas de Charolas',  placeholder: '0', icon: '📦' },
];

export default function InventarioPage({ onBack }) {
  return (
    <motion.div
      className="cv-inv-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <motion.button
        className="cv-inv-back"
        onClick={onBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96 }}
      >
        ← Volver a la Calculadora
      </motion.button>

      <h2 className="cv-inv-page__title">
        <span className="cv-inv-page__title-decor">✦</span>
        &nbsp; Módulo de Inventario &nbsp;
        <span className="cv-inv-page__title-decor">✦</span>
      </h2>
      <p className="cv-inv-page__desc">
        Este módulo estará conectado a Supabase para gestión de inventario en tiempo real.
      </p>

      <div className="cv-inv-page__grid">

        {/* ── Login panel ── */}
        <motion.div
          className="cv-inv-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="cv-inv-panel__header">
            <span className="cv-inv-panel__icon">🔐</span>
            <div>
              <h3 className="cv-inv-panel__title">Acceso al Inventario</h3>
              <p className="cv-inv-panel__subtitle">Autenticación con Supabase Auth</p>
            </div>
          </div>

          <div className="cv-inv-panel__body">
            <div className="cv-inv-field">
              <label className="cv-inv-field__label">Usuario</label>
              <input
                className="cv-inv-field__input"
                type="text"
                placeholder="usuario@crystalvanilla.mx"
                disabled
              />
            </div>
            <div className="cv-inv-field">
              <label className="cv-inv-field__label">Contraseña</label>
              <input
                className="cv-inv-field__input"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>
            <button className="cv-inv-btn-login" disabled>
              Iniciar Sesión
            </button>
          </div>

          {/* Overlay */}
          <div className="cv-inv-panel__overlay">
            <motion.span
              className="cv-inv-coming"
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              Próximamente
            </motion.span>
            <span className="cv-inv-badge">Supabase Auth · Pendiente</span>
          </div>
        </motion.div>

        {/* ── Inventory form panel ── */}
        <motion.div
          className="cv-inv-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="cv-inv-panel__header">
            <span className="cv-inv-panel__icon">📋</span>
            <div>
              <h3 className="cv-inv-panel__title">Control de Inventario</h3>
              <p className="cv-inv-panel__subtitle">Existencias actuales en tiempo real</p>
            </div>
          </div>

          <div className="cv-inv-panel__body">
            {FIELDS.map((field) => (
              <div key={field.id} className="cv-inv-field">
                <label className="cv-inv-field__label">
                  {field.icon} {field.label}
                </label>
                <input
                  className="cv-inv-field__input"
                  type="number"
                  placeholder={field.placeholder}
                  disabled
                />
              </div>
            ))}
            <button className="cv-inv-btn-save" disabled>
              Guardar Inventario
            </button>
          </div>

          {/* Overlay */}
          <div className="cv-inv-panel__overlay">
            <motion.span
              className="cv-inv-coming"
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
            >
              Próximamente
            </motion.span>
            <span className="cv-inv-badge">Supabase DB · Pendiente</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
