import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getAllUsuarios, toggleUsuarioActivo, updateRolUsuario, registrarLog } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const BLANK_FORM = { nombre: '', username: '', password: '', confirmar: '', rol: 'empleado' };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState({ text: '', err: false });
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(BLANK_FORM);
  const [creating,    setCreating]    = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try { setUsuarios(await getAllUsuarios()); }
    catch (e) { flash(`Error: ${e.message}`, true); }
    finally { setLoading(false); }
  };

  const flash = (text, err = false) => {
    setMsg({ text, err });
    setTimeout(() => setMsg({ text: '', err: false }), 4000);
  };

  const toggleActivo = async (uid, activo) => {
    try {
      await toggleUsuarioActivo(uid, !activo);
      await registrarLog(currentUser.id, 'modificar_usuario', `${uid} activo → ${!activo}`);
      flash(activo ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsuarios();
    } catch (e) { flash(`Error: ${e.message}`, true); }
  };

  const cambiarRol = async (uid, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'empleado' : 'admin';
    if (!window.confirm(`¿Cambiar rol a ${nuevoRol}?`)) return;
    try {
      await updateRolUsuario(uid, nuevoRol);
      await registrarLog(currentUser.id, 'modificar_usuario', `${uid} rol → ${nuevoRol}`);
      flash(`Rol actualizado a ${nuevoRol}`);
      fetchUsuarios();
    } catch (e) { flash(`Error: ${e.message}`, true); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.username || !form.password) { flash('Completa todos los campos', true); return; }
    if (form.password.length < 6)                          { flash('Contraseña mínimo 6 caracteres', true); return; }
    if (form.password !== form.confirmar)                  { flash('Las contraseñas no coinciden', true); return; }

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('crear_usuario', {
        p_nombre:   form.nombre.trim(),
        p_username: form.username.trim(),
        p_password: form.password,
        p_rol:      form.rol,
      });
      if (error) throw error;
      await registrarLog(currentUser.id, 'crear_usuario', `Nuevo usuario: ${form.username} (${form.rol})`);
      flash(`Usuario ${form.username} creado correctamente ✓`);
      setForm(BLANK_FORM);
      setShowForm(false);
      fetchUsuarios();
    } catch (e) {
      flash(e.message.includes('ya existe') ? 'El usuario ya existe' : `Error: ${e.message}`, true);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="cv-dash__loading">Cargando usuarios...</div>;

  return (
    <div className="cv-dash-panel">
      <div className="cv-dash-panel__header">
        <h3 className="cv-dash-panel__title">👥 Gestión de Usuarios</h3>
        <div className="cv-dash-panel__actions">
          {msg.text && (
            <span className={`cv-dash-panel__msg ${msg.err ? 'cv-dash-panel__msg--err' : ''}`}>
              {msg.text}
            </span>
          )}
          <motion.button
            className="cv-dash-btn cv-dash-btn--save"
            onClick={() => setShowForm((v) => !v)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            {showForm ? '✕ Cancelar' : '➕ Nuevo usuario'}
          </motion.button>
        </div>
      </div>

      {/* ── Formulario crear usuario ── */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            className="cv-dash-newuser"
            onSubmit={handleCrear}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            noValidate
          >
            <h4 className="cv-dash-newuser__title">Crear nuevo usuario</h4>
            <div className="cv-dash-newuser__grid">
              <div className="cv-dash-newuser__field">
                <label>Nombre completo</label>
                <input className="cv-dash-newuser__input" placeholder="Ej. Juan Pérez"
                  value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="cv-dash-newuser__field">
                <label>Nombre de usuario</label>
                <input className="cv-dash-newuser__input" placeholder="Ej. Juan2026"
                  value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              </div>
              <div className="cv-dash-newuser__field">
                <label>Contraseña</label>
                <div className="cv-dash-newuser__pass-wrap">
                  <input type={showPass ? 'text' : 'password'} className="cv-dash-newuser__input"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  <button type="button" className="cv-chpass__eye" onClick={() => setShowPass((v) => !v)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="cv-dash-newuser__field">
                <label>Confirmar contraseña</label>
                <input type="password" className="cv-dash-newuser__input" placeholder="Repite la contraseña"
                  value={form.confirmar} onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value }))} />
              </div>
              <div className="cv-dash-newuser__field">
                <label>Rol</label>
                <select className="cv-dash-newuser__input cv-dash-newuser__select"
                  value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <motion.button type="submit" className="cv-dash-btn cv-dash-btn--save cv-dash-newuser__btn"
              disabled={creating} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {creating ? '⏳ Creando...' : '✅ Crear usuario'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Lista de usuarios ── */}
      <div className="cv-dash-users">
        {usuarios.map((u, i) => (
          <motion.div key={u.id}
            className={`cv-dash-user__row ${!u.activo ? 'cv-dash-user__row--inactivo' : ''}`}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}>
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
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                  {u.activo ? '🚫 Desactivar' : '✅ Activar'}
                </motion.button>
                <motion.button
                  className="cv-dash-btn cv-dash-btn--sm cv-dash-btn--edit"
                  onClick={() => cambiarRol(u.id, u.rol)}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
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
