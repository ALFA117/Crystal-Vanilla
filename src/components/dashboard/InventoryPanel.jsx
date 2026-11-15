import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateAlmacen, registrarLog } from '../../services/supabase';
import Icon from '../Icon';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS = [
  { key: 'paquetes_botellas',  label: 'Paquetes de Botellas',       icon: 'bottle', unit: 'paquetes', equiv: '1 paquete = 200 botellas' },
  { key: 'paquetes_charolas',  label: 'Paquetes de Charolas',       icon: 'layers', unit: 'paquetes', equiv: '1 paquete = 20 charolas'  },
  { key: 'paquetes_tapas',     label: 'Cajas de Tapas',             icon: 'box', unit: 'cajas',    equiv: '1 caja de tapas'           },
  { key: 'paquetes_etiquetas', label: 'Cajas de Rollos Etiquetas',  icon: 'tag', unit: 'cajas',    equiv: '1 caja de rollos'          },
];

function parseOtros(raw) {
  try { return Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []); }
  catch { return []; }
}

export default function InventoryPanel({ almacen, onRefresh }) {
  const { user, isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState({});
  const [otros,    setOtros]    = useState([]);
  const [nuevoItem, setNuevoItem] = useState({ nombre: '', cantidad: '', unidad: 'piezas' });
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');

  if (!almacen) return <div className="cv-dash__loading" role="status"><Icon name="loader" size={18} /> Cargando inventario…</div>;

  const startEdit = () => {
    setForm({
      paquetes_botellas:  almacen.paquetes_botellas,
      paquetes_charolas:  almacen.paquetes_charolas,
      paquetes_tapas:     almacen.paquetes_tapas,
      paquetes_etiquetas: almacen.paquetes_etiquetas,
    });
    setOtros(parseOtros(almacen.otros));
    setEditMode(true);
    setMsg('');
  };

  const cancelEdit = () => { setEditMode(false); setMsg(''); };

  const addOtro = () => {
    if (!nuevoItem.nombre.trim() || !nuevoItem.cantidad) return;
    setOtros((prev) => [
      ...prev,
      { id: Date.now().toString(), nombre: nuevoItem.nombre.trim(), cantidad: Number(nuevoItem.cantidad), unidad: nuevoItem.unidad },
    ]);
    setNuevoItem({ nombre: '', cantidad: '', unidad: 'piezas' });
  };

  const removeOtro = (id) => setOtros((prev) => prev.filter((o) => o.id !== id));

  const updateOtroCantidad = (id, val) =>
    setOtros((prev) => prev.map((o) => o.id === id ? { ...o, cantidad: Number(val) } : o));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAlmacen(almacen.id, { ...form, otros: JSON.stringify(otros) });
      await registrarLog(user.id, 'modificacion_inventario', 'Inventario actualizado');
      setMsg('Guardado');
      setEditMode(false);
      onRefresh();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const otrosActuales = parseOtros(almacen.otros);

  return (
    <div className="cv-dash-panel">
      <div className="cv-dash-panel__header">
        <h3 className="cv-dash-panel__title"><Icon name="box" size={18} /> Inventario del almacén</h3>
        <div className="cv-dash-panel__actions">
          {msg && <span className="cv-dash-panel__msg">{msg}</span>}
          {isAdmin && !editMode && (
            <motion.button className="cv-dash-btn cv-dash-btn--edit" onClick={startEdit}>
              <Icon name="pencil" size={16} /> Editar
            </motion.button>
          )}
          {editMode && (
            <>
              <motion.button className="cv-dash-btn cv-dash-btn--save" onClick={handleSave} disabled={saving}>
                {saving ? <><Icon name="loader" size={16} /> Guardando…</> : <><Icon name="save" size={16} /> Guardar</>}
              </motion.button>
              <motion.button className="cv-dash-btn cv-dash-btn--cancel" onClick={cancelEdit}
                aria-label="Cancelar edición">
                <Icon name="x" size={16} />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Artículos principales ── */}
      <div className="cv-dash-inv__grid">
        {ITEMS.map((item, i) => (
          <motion.div key={item.key} className="cv-dash-inv__card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            >
            <span className="cv-dash-inv__icon"><Icon name={item.icon} size={18} /></span>
            <p className="cv-dash-inv__label">{item.label}</p>
            {editMode ? (
              <input type="number" min="0" className="cv-dash-inv__input"
                value={form[item.key] ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, [item.key]: Number(e.target.value) }))} />
            ) : (
              <span className="cv-dash-inv__value">{(almacen[item.key] ?? 0).toLocaleString('es-MX')}</span>
            )}
            <span className="cv-dash-inv__unit">{item.unit}</span>
            <span className="cv-dash-inv__equiv">{item.equiv}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Sección Otros ── */}
      <div className="cv-dash-otros">
        <h4 className="cv-dash-otros__title"><Icon name="list" size={16} /> Otros artículos</h4>

        {/* Lista actual */}
        {(editMode ? otros : otrosActuales).length === 0 && (
          <p className="cv-dash__empty">
            Sin artículos extra registrados.
          </p>
        )}

        <div className="cv-dash-otros__list">
          {(editMode ? otros : otrosActuales).map((o, i) => (
            <motion.div key={o.id} className="cv-dash-otros__row"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <span className="cv-dash-otros__nombre">{o.nombre}</span>
              {editMode ? (
                <input type="number" min="0" className="cv-dash-otros__qty-input"
                  value={o.cantidad}
                  onChange={(e) => updateOtroCantidad(o.id, e.target.value)} />
              ) : (
                <span className="cv-dash-otros__qty">{o.cantidad.toLocaleString('es-MX')}</span>
              )}
              <span className="cv-dash-otros__unidad">{o.unidad}</span>
              {editMode && (
                <button type="button" className="cv-dash-otros__del" onClick={() => removeOtro(o.id)} aria-label={`Quitar ${o.nombre}`}><Icon name="trash" size={16} /></button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Agregar nuevo */}
        {editMode && isAdmin && (
          <div className="cv-dash-otros__add">
            <input className="cv-dash-otros__add-input" placeholder="Nombre del artículo"
              value={nuevoItem.nombre}
              onChange={(e) => setNuevoItem((n) => ({ ...n, nombre: e.target.value }))} />
            <input type="number" min="0" className="cv-dash-otros__add-qty" placeholder="Cantidad"
              value={nuevoItem.cantidad}
              onChange={(e) => setNuevoItem((n) => ({ ...n, cantidad: e.target.value }))} />
            <input className="cv-dash-otros__add-input" placeholder="Unidad (piezas, botes…)"
              value={nuevoItem.unidad}
              onChange={(e) => setNuevoItem((n) => ({ ...n, unidad: e.target.value }))} />
            <motion.button className="cv-dash-btn cv-dash-btn--save cv-dash-btn--sm" onClick={addOtro}>
              <Icon name="plus" size={16} /> Agregar
            </motion.button>
          </div>
        )}
      </div>

      <p className="cv-dash-inv__updated">
        Actualizado: {new Date(almacen.updated_at).toLocaleString('es-MX')}
      </p>
    </div>
  );
}
