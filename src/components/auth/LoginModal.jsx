import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      onClose();
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Usuario o contraseña incorrectos'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="cv-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="cv-modal"
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        {/* Header dorado */}
        <div className="cv-modal__header">
          <span className="cv-modal__logo">🌿</span>
          <div>
            <h2 className="cv-modal__title">Crystal Vanilla</h2>
            <p className="cv-modal__subtitle">Acceso al sistema</p>
          </div>
          <button className="cv-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="cv-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="cv-modal__field">
            <label className="cv-modal__label">Usuario o correo</label>
            <div className="cv-modal__input-wrap">
              <span className="cv-modal__input-icon">👤</span>
              <input
                type="text"
                className="cv-modal__input"
                placeholder="aldogaya  o  correo@ejemplo.com"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="cv-modal__field">
            <label className="cv-modal__label">Contraseña</label>
            <div className="cv-modal__input-wrap">
              <span className="cv-modal__input-icon">🔑</span>
              <input
                type={showPass ? 'text' : 'password'}
                className="cv-modal__input cv-modal__input--pass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="cv-modal__eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="cv-modal__error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                ⚠️ {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="cv-modal__btn"
            disabled={loading}
            whileHover={!loading ? { scale: 1.03, boxShadow: '0 8px 28px rgba(212,160,23,0.5)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
          >
            {loading ? (
              <span className="cv-modal__spinner">⏳ Verificando...</span>
            ) : (
              '✨ Ingresar al sistema'
            )}
          </motion.button>

          <p className="cv-modal__forgot">
            ¿Olvidaste tu contraseña?{' '}
            <span className="cv-modal__forgot-link">Contacta al administrador</span>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
