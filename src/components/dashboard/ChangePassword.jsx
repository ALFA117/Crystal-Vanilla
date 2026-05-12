import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { registrarLog } from '../../services/supabase';

export default function ChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nueva: '', confirmar: '' });
  const [show, setShow] = useState({ nueva: false, confirmar: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]     = useState('');
  const [isError, setIsError] = useState(false);

  const flash = (text, err = false) => {
    setMsg(text); setIsError(err);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nueva || !form.confirmar) { flash('Completa todos los campos', true); return; }
    if (form.nueva.length < 6)          { flash('La contraseña debe tener al menos 6 caracteres', true); return; }
    if (form.nueva !== form.confirmar)  { flash('Las contraseñas no coinciden', true); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.nueva });
      if (error) throw error;
      await registrarLog(user.id, 'cambio_password', 'Contraseña actualizada correctamente');
      flash('Contraseña actualizada correctamente ✓');
      setForm({ nueva: '', confirmar: '' });
    } catch (err) {
      flash(err.message || 'Error al cambiar la contraseña', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-dash-panel">
      <h3 className="cv-dash-panel__title">🔑 Cambiar Contraseña</h3>

      <form className="cv-chpass__form" onSubmit={handleSubmit} noValidate>

        <div className="cv-chpass__field">
          <label className="cv-chpass__label">Nueva contraseña</label>
          <div className="cv-chpass__wrap">
            <input
              type={show.nueva ? 'text' : 'password'}
              className="cv-chpass__input"
              placeholder="Mínimo 6 caracteres"
              value={form.nueva}
              onChange={(e) => setForm((f) => ({ ...f, nueva: e.target.value }))}
            />
            <button type="button" className="cv-chpass__eye"
              onClick={() => setShow((s) => ({ ...s, nueva: !s.nueva }))}>
              {show.nueva ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="cv-chpass__field">
          <label className="cv-chpass__label">Confirmar contraseña</label>
          <div className="cv-chpass__wrap">
            <input
              type={show.confirmar ? 'text' : 'password'}
              className="cv-chpass__input"
              placeholder="Repite la contraseña"
              value={form.confirmar}
              onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value }))}
            />
            <button type="button" className="cv-chpass__eye"
              onClick={() => setShow((s) => ({ ...s, confirmar: !s.confirmar }))}>
              {show.confirmar ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.p
              className={`cv-chpass__msg ${isError ? 'cv-chpass__msg--error' : 'cv-chpass__msg--ok'}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {isError ? '⚠️' : '✓'} {msg}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          className="cv-dash-btn cv-dash-btn--save cv-chpass__btn"
          disabled={loading}
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
        >
          {loading ? '⏳ Guardando...' : '🔐 Actualizar contraseña'}
        </motion.button>
      </form>
    </div>
  );
}
