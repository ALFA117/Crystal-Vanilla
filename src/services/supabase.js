import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// createClient lanza error si las vars están vacías — nunca debe romper el módulo
let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  } else {
    console.warn('[Supabase] Variables de entorno no configuradas. Autenticación desactivada.');
  }
} catch (e) {
  console.error('[Supabase] Error al inicializar:', e.message);
}

export { supabase };

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginWithEmailOrUsername(identifier, password) {
  let email = identifier;
  if (!identifier.includes('@')) {
    const { data, error } = await supabase.rpc('get_email_by_username', { p_username: identifier });
    if (error || !data) throw new Error('Usuario no encontrado');
    email = data;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export async function getPerfil(userId) {
  const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function getAllUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updatePerfil(userId, updates) {
  const { error } = await supabase.from('usuarios').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

export async function toggleUsuarioActivo(userId, activo) {
  return updatePerfil(userId, { activo });
}

export async function updateRolUsuario(userId, rol) {
  return updatePerfil(userId, { rol });
}

// ── Almacén ───────────────────────────────────────────────────────────────────

export async function getAlmacen() {
  const { data, error } = await supabase.from('almacen').select('*').order('created_at', { ascending: false }).limit(1).single();
  if (error) throw error;
  return data;
}

export async function updateAlmacen(almacenId, campos) {
  const { error } = await supabase.from('almacen').update({ ...campos, updated_at: new Date().toISOString() }).eq('id', almacenId);
  if (error) throw error;
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function registrarLog(usuarioId, accion, descripcion) {
  const { error } = await supabase.from('logs').insert({ usuario_id: usuarioId, accion, descripcion });
  if (error) console.warn('[Log]', error.message);
}

export async function getLogs(limit = 50) {
  const { data, error } = await supabase
    .from('logs')
    .select('*, usuarios(nombre, username, rol)')
    .order('fecha', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
