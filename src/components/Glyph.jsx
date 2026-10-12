/**
 * Íconos de la app. Antes eran emojis (🌿 📦 🔐 💧 …): se veían distinto en
 * cada sistema, en Windows algunos salían como cuadros y no heredaban el
 * color de la marca. Este componente recibe el mismo emoji de siempre y
 * dibuja un SVG de trazo con `currentColor`; si no lo conoce, lo deja tal cual.
 * `withGlyph('🏪 Tiendas')` sirve para títulos que traen el emoji al inicio.
 */
const P = {
  leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 3.13a4 4 0 0 1 0 7.75M22 21a7 7 0 0 0-4-6.3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  unlock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  sparkle: <><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></>,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></>,
  cap: <><rect x="6" y="3" width="12" height="6" rx="1.5" /><path d="M8 9v3h8V9M9 3v6M12 3v6M15 3v6" /></>,
  clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h4" /></>,
  drop: <><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5 12 2.5C11.5 5 10 7.9 8 9.5S5 13 5 15a7 7 0 0 0 7 7Z" /></>,
  store: <><path d="M3 9 4.5 4h15L21 9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v9h14v-9M10 21v-5h4v5" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  ruler: <><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" /><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2" /></>,
  bottle: <><path d="M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3Z" /><path d="M8 13h8" /></>,
  tag: <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  dot: <><circle cx="12" cy="12" r="6" /></>,
  door: <><path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01" /><path d="M13 4.6v16.8a1 1 0 0 1-1.2 1L5 20V5.6a2 2 0 0 1 1.6-2l5-1A1 1 0 0 1 13 3.6Z" /></>,
  pencil: <><path d="M21.2 6.8a2.8 2.8 0 0 0-4-4L4 16l-1 5 5-1Z" /><path d="m15 5 4 4" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
  trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  note: <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  check: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  ban: <><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  mailbox: <><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5A3.5 3.5 0 0 1 5.5 6H18a4 4 0 0 1 4 4Z" /><path d="M15 9h3M6 10h4" /></>,
};

const MAP = {
  '🌿': 'leaf', '📊': 'chart', '📦': 'box', '👤': 'user', '👥': 'users', '🔐': 'lock', '🔒': 'lock',
  '🔓': 'unlock', '🔑': 'key', '⚠': 'alert', '✨': 'sparkle', '🛍': 'bag', '🔩': 'cap', '📋': 'clipboard',
  '💧': 'drop', '🏪': 'store', '📄': 'file', '📐': 'ruler', '🧴': 'bottle', '🏷': 'tag', '🔵': 'dot',
  '🚪': 'door', '✏': 'pencil', '💾': 'save', '🗑': 'trash', '📝': 'note', '➕': 'plus', '✅': 'check',
  '🚫': 'ban', '🔄': 'refresh', '👁': 'eye', '🙈': 'eyeOff', '📫': 'mailbox',
};

export function Glyph({ i, size = '1.1em', className = '' }) {
  const key = String(i ?? '').replace(/️/g, '').trim();
  const name = MAP[key];
  if (!name) return <>{i}</>;
  return (
    <svg
      className={`cv-glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }}
    >
      {P[name]}
    </svg>
  );
}

/** "🏪 Tiendas" → [ícono, " Tiendas"]. Si no empieza con un emoji conocido, regresa el texto igual. */
export function withGlyph(text) {
  if (typeof text !== 'string') return text;
  const m = text.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u);
  if (!m || !MAP[m[1].replace(/️/g, '')]) return text;
  return <><Glyph i={m[1]} /> {m[2]}</>;
}
