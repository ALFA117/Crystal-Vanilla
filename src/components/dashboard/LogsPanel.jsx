import { motion } from 'framer-motion';

const ACCION_ICONS = {
  login:                   '🔓',
  logout:                  '🔒',
  modificacion_inventario: '📦',
  cambio_password:         '🔑',
  crear_usuario:           '👤',
  eliminar_usuario:        '🗑️',
  modificar_usuario:       '✏️',
};

export default function LogsPanel({ logs, loading }) {
  if (loading) return <div className="cv-dash__loading">Cargando actividad...</div>;
  if (!logs?.length) return (
    <div className="cv-dash-panel">
      <h3 className="cv-dash-panel__title">📋 Actividad Reciente</h3>
      <p className="cv-dash__empty">Sin actividad registrada aún.</p>
    </div>
  );

  return (
    <div className="cv-dash-panel">
      <h3 className="cv-dash-panel__title">📋 Actividad Reciente</h3>
      <div className="cv-dash-logs">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            className="cv-dash-log__row"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className="cv-dash-log__icon">
              {ACCION_ICONS[log.accion] || '📝'}
            </span>
            <div className="cv-dash-log__info">
              <span className="cv-dash-log__accion">{log.accion.replace(/_/g, ' ')}</span>
              {log.descripcion && (
                <span className="cv-dash-log__desc">{log.descripcion}</span>
              )}
              <span className="cv-dash-log__user">
                {log.usuarios?.nombre || 'Sistema'}
                {log.usuarios?.rol && (
                  <span className={`cv-dash-log__rol cv-dash-log__rol--${log.usuarios.rol}`}>
                    {log.usuarios.rol}
                  </span>
                )}
              </span>
            </div>
            <span className="cv-dash-log__fecha">
              {new Date(log.fecha).toLocaleString('es-MX', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
