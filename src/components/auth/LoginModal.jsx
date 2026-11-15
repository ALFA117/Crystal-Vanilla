import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon, { BrandMark } from '../Icon';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const { login, servidor } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-login-title"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.98, y: 4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="cv-modal__header">
          <span className="cv-modal__logo"><BrandMark size={40} /></span>
          <div>
            <h2 id="cv-login-title" className="cv-modal__title">Acceso al inventario</h2>
            <p className="cv-modal__subtitle">Solo personal de Crystal Vanilla. La calculadora no necesita cuenta.</p>
          </div>
          <button type="button" className="cv-icon-btn cv-modal__close" onClick={onClose} aria-label="Cerrar"><Icon name="x" size={20} /></button>
        </div>

        <form className="cv-modal__form" onSubmit={handleSubmit} noValidate>
          {servidor === 'offline' && (
            <p className="cv-modal__notice" role="status">
              <Icon name="info" size={16} />
              <span>El servidor de inventario no responde en este momento, así que no podrás entrar. La calculadora funciona sin cuenta.</span>
            </p>
          )}
          <div className="cv-modal__field">
            <label className="cv-modal__label" htmlFor="cv-login-user">Usuario</label>
            <div className="cv-modal__input-wrap">
              <span className="cv-modal__input-icon"><Icon name="user" size={18} /></span>
              <input
                id="cv-login-user"
                type="text"
                className="cv-modal__input"
                placeholder="Tu usuario o correo"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="cv-modal__field">
            <label className="cv-modal__label" htmlFor="cv-login-pass">Contraseña</label>
            <div className="cv-modal__input-wrap">
              <span className="cv-modal__input-icon"><Icon name="key" size={18} /></span>
              <input
                id="cv-login-pass"
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
                <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                className="cv-modal__error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon name="alert" size={16} /> {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="cv-modal__btn"
            disabled={loading}
          >
            {loading ? (
              <span className="cv-modal__spinner"><Icon name="loader" size={18} /> Verificando…</span>
            ) : (
              <><Icon name="login" size={18} /> Ingresar al sistema</>
            )}
          </motion.button>

        </form>
      </motion.div>
    </motion.div>
  );
}
