import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { useAuth } from '../../contexts/AuthContext';
import { getAlmacen, getLogs } from '../../services/supabase';
import InventoryPanel  from './InventoryPanel';
import LogsPanel       from './LogsPanel';
import UserManagement  from './UserManagement';
import ChangePassword  from './ChangePassword';

const SUMMARY_ITEMS = [
  { key: 'paquetes_botellas',  label: 'Paquetes de Botellas', icon: 'bottle', sub: 'paquetes × 200 botellas' },
  { key: 'paquetes_charolas',  label: 'Paquetes de Charolas', icon: 'layers', sub: 'paquetes × 20 charolas'  },
  { key: 'paquetes_tapas',     label: 'Cajas de Tapas',       icon: 'box', sub: 'paquetes de tapas'       },
  { key: 'paquetes_etiquetas', label: 'Cajas de Etiquetas',   icon: 'tag', sub: 'cajas de rollos'         },
];

const ADMIN_TABS = [
  { id: 'inventario', icon: 'box',   label: 'Inventario' },
  { id: 'logs',       icon: 'list',  label: 'Actividad'  },
  { id: 'usuarios',   icon: 'users', label: 'Usuarios'   },
  { id: 'password',   icon: 'key',   label: 'Contraseña' },
];

function parseOtros(raw) {
  try { return Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []); } catch { return []; }
}

export default function DashboardPage({ onBack }) {
  const { perfil, isAdmin, logout } = useAuth();
  const [tab,         setTab]         = useState('inventario');
  const [almacen,     setAlmacen]     = useState(null);
  const [logs,        setLogs]        = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => { fetchAlmacen(); }, []);
  useEffect(() => { if (tab === 'logs') fetchLogs(); }, [tab]);

  const fetchAlmacen = async () => {
    try { setAlmacen(await getAlmacen()); } catch { /* sin datos */ }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try { setLogs(await getLogs(60)); } catch { setLogs([]); }
    finally { setLoadingLogs(false); }
  };

  const handleLogout = async () => { await logout(); onBack(); };

  // ── Tarjetas de resumen (compartido admin + empleado) ──────────────────────
  const SummaryCards = () => almacen ? (
    <>
      <div className="cv-dash__summary">
        {SUMMARY_ITEMS.map((item, i) => (
          <motion.div key={item.key} className="cv-dash__summary-card"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            >
            <span className="cv-dash__summary-icon"><Icon name={item.icon} size={18} /></span>
            <span className="cv-dash__summary-value">
              {(almacen[item.key] ?? 0).toLocaleString('es-MX')}
            </span>
            <span className="cv-dash__summary-label">{item.label}</span>
            <span className="cv-dash__summary-sub">{item.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Otros artículos (solo si hay) */}
      {parseOtros(almacen.otros).length > 0 && (
        <div className="cv-dash-panel cv-dash__otros-view">
          <h4 className="cv-dash-otros__title"><Icon name="list" size={16} /> Otros artículos</h4>
          <div className="cv-dash-otros__list">
            {parseOtros(almacen.otros).map((o) => (
              <div key={o.id} className="cv-dash-otros__row">
                <span className="cv-dash-otros__nombre">{o.nombre}</span>
                <span className="cv-dash-otros__qty">{o.cantidad.toLocaleString('es-MX')}</span>
                <span className="cv-dash-otros__unidad">{o.unidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  ) : <div className="cv-dash__loading" role="status"><Icon name="loader" size={18} /> Cargando inventario…</div>;

  return (
    <motion.div className="cv-dash"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>

      {/* Topbar */}
      <div className="cv-dash__topbar">
        <div className="cv-dash__topbar-left">
          <motion.button className="cv-dash-btn cv-dash-btn--back" onClick={onBack}>
            <Icon name="arrowLeft" size={17} /> Calculadora
          </motion.button>
          <div className="cv-dash__welcome">
            <span className="cv-dash__welcome-name">{perfil?.nombre || 'Usuario'}</span>
            <span className={`cv-dash__rol cv-dash__rol--${perfil?.rol}`}>{perfil?.rol || 'empleado'}</span>
          </div>
        </div>
        <motion.button className="cv-dash-btn cv-dash-btn--logout" onClick={handleLogout}>
          <Icon name="logout" size={17} /> Salir
        </motion.button>
      </div>

      {/* ── EMPLEADO: solo resumen + cambiar contraseña ── */}
      {!isAdmin ? (
        <>
          <SummaryCards />
          <ChangePassword />
        </>
      ) : (
        /* ── ADMIN: resumen + tabs completos ── */
        <>
          <SummaryCards />

          <div className="cv-dash__tabs" role="tablist" aria-label="Secciones del panel">
            {ADMIN_TABS.map((t) => (
              <button key={t.id}
                className={`cv-dash__tab ${tab === t.id ? 'cv-dash__tab--active' : ''}`}
                role="tab" aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}>
                <Icon name={t.icon} size={16} /> {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {tab === 'inventario' && <InventoryPanel almacen={almacen} onRefresh={fetchAlmacen} />}
              {tab === 'logs'       && <LogsPanel logs={logs} loading={loadingLogs} />}
              {tab === 'usuarios'   && <UserManagement />}
              {tab === 'password'   && <ChangePassword />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
