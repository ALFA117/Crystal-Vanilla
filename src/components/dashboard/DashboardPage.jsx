import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getAlmacen, getLogs } from '../../services/supabase';
import InventoryPanel  from './InventoryPanel';
import LogsPanel       from './LogsPanel';
import UserManagement  from './UserManagement';

const TABS = [
  { id: 'inventario', label: '📦 Inventario' },
  { id: 'logs',       label: '📋 Actividad'  },
  { id: 'usuarios',   label: '👥 Usuarios',  adminOnly: true },
];

export default function DashboardPage({ onBack }) {
  const { perfil, isAdmin, logout } = useAuth();
  const [tab,     setTab]     = useState('inventario');
  const [almacen, setAlmacen] = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  useEffect(() => { fetchAlmacen(); }, []);
  useEffect(() => { if (tab === 'logs') fetchLogs(); }, [tab]);

  const fetchAlmacen = async () => {
    try { setAlmacen(await getAlmacen()); } catch { /* sin datos aún */ }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try { setLogs(await getLogs(60)); } catch { setLogs([]); }
    finally { setLoadingLogs(false); }
  };

  const handleLogout = async () => {
    await logout();
    onBack();
  };

  return (
    <motion.div
      className="cv-dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Barra superior */}
      <div className="cv-dash__topbar">
        <div className="cv-dash__topbar-left">
          <motion.button
            className="cv-dash-btn cv-dash-btn--back"
            onClick={onBack}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            ← Calculadora
          </motion.button>
          <div className="cv-dash__welcome">
            <span className="cv-dash__welcome-name">
              {perfil?.nombre || 'Usuario'}
            </span>
            <span className={`cv-dash__rol cv-dash__rol--${perfil?.rol}`}>
              {perfil?.rol || 'empleado'}
            </span>
          </div>
        </div>

        <motion.button
          className="cv-dash-btn cv-dash-btn--logout"
          onClick={handleLogout}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        >
          🚪 Salir
        </motion.button>
      </div>

      {/* Resumen rápido del almacén */}
      {almacen && (
        <div className="cv-dash__summary">
          {[
            { label: 'Botellas',  value: almacen.paquetes_botellas,  icon: '🧴' },
            { label: 'Charolas',  value: almacen.paquetes_charolas,  icon: '📦' },
            { label: 'Tapas',     value: almacen.paquetes_tapas,     icon: '🔵' },
            { label: 'Etiquetas', value: almacen.paquetes_etiquetas, icon: '🏷️' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="cv-dash__summary-card"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(212,160,23,0.3)' }}
            >
              <span className="cv-dash__summary-icon">{item.icon}</span>
              <span className="cv-dash__summary-value">
                {(item.value ?? 0).toLocaleString('es-MX')}
              </span>
              <span className="cv-dash__summary-label">{item.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="cv-dash__tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`cv-dash__tab ${tab === t.id ? 'cv-dash__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'inventario' && (
            <InventoryPanel almacen={almacen} onRefresh={fetchAlmacen} />
          )}
          {tab === 'logs' && (
            <LogsPanel logs={logs} loading={loadingLogs} />
          )}
          {tab === 'usuarios' && isAdmin && (
            <UserManagement />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
