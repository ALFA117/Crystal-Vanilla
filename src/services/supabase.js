/**
 * Crystal Vanilla — Supabase client
 *
 * Para activar:
 *   1. npm install @supabase/supabase-js
 *   2. Crear archivo .env en la raíz con:
 *        VITE_SUPABASE_URL=https://xxxx.supabase.co
 *        VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   3. Descomentar el bloque de abajo
 *
 * Tabla sugerida en Supabase:
 *   CREATE TABLE inventario (
 *     id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     updated_at    timestamptz DEFAULT now(),
 *     bolsas_botellas   int DEFAULT 0,
 *     cajas_tapas       int DEFAULT 0,
 *     cajas_charolas    int DEFAULT 0
 *   );
 */

// import { createClient } from '@supabase/supabase-js'
//
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// )
//
// /** Obtiene el registro de inventario actual */
// export async function getInventario() {
//   const { data, error } = await supabase
//     .from('inventario')
//     .select('*')
//     .order('updated_at', { ascending: false })
//     .limit(1)
//     .single()
//   if (error) throw error
//   return data
// }
//
// /** Guarda / actualiza el inventario */
// export async function saveInventario({ bolsas_botellas, cajas_tapas, cajas_charolas }) {
//   const { error } = await supabase
//     .from('inventario')
//     .upsert({
//       bolsas_botellas,
//       cajas_tapas,
//       cajas_charolas,
//       updated_at: new Date().toISOString(),
//     })
//   if (error) throw error
// }

export const supabase = null // placeholder — pendiente de conexión
