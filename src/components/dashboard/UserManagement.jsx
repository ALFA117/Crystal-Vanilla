import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsuarios, toggleUsuarioActivo, updateRolUsuario, registrarLog } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState('');

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try { setUsuarios(await getAllUsuarios()); }
    catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const toggleActivo = async (uid, activo) => {
    try {
      await toggleUsuarioActivo(uid, !activo);
      await registrarLog(currentUser.id, 'modificar_usuario', `Usuario ${uid} — activo: ${!activo}`);
      flash(activo ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsuarios();
    } catch (e) { flash(`Error: ${e.message}`); }
  };

  const cambiarRol = async (uid, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'empleado' : 'admin';
    if (!window.confirm(`¿Cambiar rol a ${nuevoRol}?`)) return;
    try {
      await updateRolUsuario(uid, nuevoRol);
      await registrarLog(currentUser.id, 'modificar_usuario', `Usuario ${uid} — rol cambiado a ${nuevoRol}`);
      flash(`Rol actualizado a ${nuevoRol}`);
      fetchUsuarios();
    } catch (e) { flash(`Error: ${e.message}`); }
  };

  if (loading) return <div className="cv-dash__loading">Cargando usuarios...</div>;

  return (
    <div className="cv-dash-panel">
      <div className="cv-dash-panel__header">
        <h3 className="cv-dash-panel__title">👥 Gestión de Usuarios</h3>
        {msg && <span className="cv-dash-panel__msg">{msg}</span>}
      </div>

      <div className="cv-dash-users">
        {usuarios.map((u, i) => (
          <motion.div
            key={u.id}
            className={`cv-dash-user__row ${!u.activo ? 'cv-dash-user__row--inactivo' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="cv-dash-user__info">
              <span className="cv-dash-user__name">{u.nombre}</span>
              <span className="cv-dash-user__username">@{u.username}</span>
              <span className={`cv-dash-user__rol cv-dash-user__rol--${u.rol}`}>{u.rol}</span>
              {!u.activo && <span className="cv-dash-user__tag">Inactivo</span>}
            </div>
            <div className="cv-dash-user__meta">
              {u.ultimo_login && (
                <span className="cv-dash-user__login">
                  Último ingreso: {new Date(u.ultimo_login).toLocaleDateString('es-MX')}
                </span>
              )}
            </div>
            {u.id !== currentUser?.id && (
              <div className="cv-dash-user__btns">
                <motion.button
                  className={`cv-dash-btn cv-dash-btn--sm ${u.activo ? 'cv-dash-btn--warn' : 'cv-dash-btn--save'}`}
                  onClick={() => toggleActivo(u.id, u.activo)}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
                >
                  {u.activo ? '🚫 Desactivar' : '✅ Activar'}
                </motion.button>
                <motion.button
                  className="cv-dash-btn cv-dash-btn--sm cv-dash-btn--edit"
                  onClick={() => cambiarRol(u.id, u.rol)}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
                >
                  🔄 {u.rol === 'admin' ? '→ Empleado' : '→ Admin'}
                </motion.button>
              </div>
            )}
            {u.id === currentUser?.id && (
              <span className="cv-dash-user__tag cv-dash-user__tag--you">Tú</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
