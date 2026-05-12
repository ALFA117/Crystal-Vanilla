import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onLoginClick, onDashboardClick }) {
  const { user, perfil, loading } = useAuth();

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
          animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.1, 1, 1.05, 1] }}
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
          animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.05, 1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🌿
        </motion.span>

        {/* Botón Ingresar / Panel de usuario */}
        {!loading && (
          <AnimatePresence mode="wait">
            {user ? (
              <motion.button
                key="user-btn"
                className="cv-header__user-btn"
                onClick={onDashboardClick}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.06, boxShadow: '0 4px 16px rgba(212,160,23,0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="cv-header__user-icon">👤</span>
                <span className="cv-header__user-name">
                  {perfil?.nombre?.split(' ')[0] || 'Panel'}
                </span>
                <span className={`cv-header__user-rol cv-header__user-rol--${perfil?.rol}`}>
                  {perfil?.rol || ''}
                </span>
              </motion.button>
            ) : (
              <motion.button
                key="login-btn"
                className="cv-header__login-btn"
                onClick={onLoginClick}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.06, boxShadow: '0 4px 16px rgba(212,160,23,0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                🔐 Ingresar
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      <motion.div
        className="cv-header__divider"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
      />
    </header>
  );
}
