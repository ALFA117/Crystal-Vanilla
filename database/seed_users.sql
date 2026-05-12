-- ================================================================
-- Crystal Vanilla — Seed de usuarios (versión UPSERT)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ================================================================

-- ── PASO 1: Ver qué hay en auth.users ────────────────────────────────────────
-- Si este SELECT regresa 0 filas, primero crea los usuarios en
-- Authentication → Users → Add User y luego vuelve a correr este script.
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- ── PASO 2: UPSERT — inserta o actualiza, siempre fuerza los datos ───────────

INSERT INTO public.usuarios (id, nombre, username, rol, activo)
SELECT
  au.id,
  'Aldo Gaya',
  'AldoGaya2026',
  'admin',
  true
FROM auth.users au
WHERE au.email = 'aldogaya@crystalvanilla.com'
ON CONFLICT (id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  username = EXCLUDED.username,
  rol      = EXCLUDED.rol,
  activo   = EXCLUDED.activo,
  updated_at = now();

INSERT INTO public.usuarios (id, nombre, username, rol, activo)
SELECT
  au.id,
  'Eulalio Lopez',
  'EULALIO2026',
  'empleado',
  true
FROM auth.users au
WHERE au.email = 'eulaliolopez@crystalvanilla.com'
ON CONFLICT (id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  username = EXCLUDED.username,
  rol      = EXCLUDED.rol,
  activo   = EXCLUDED.activo,
  updated_at = now();

-- ── PASO 3: Verificar ────────────────────────────────────────────────────────
SELECT
  u.nombre,
  u.username,
  u.rol,
  u.activo,
  au.email
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
ORDER BY u.rol DESC;

-- ── Si el SELECT de arriba sigue vacío: ──────────────────────────────────────
-- Significa que los emails no existen en auth.users.
-- Ve a: Authentication → Users y confirma que existen exactamente:
--   aldogaya@crystalvanilla.com
--   eulaliolopez@crystalvanilla.com
-- Con esos emails exactos (sin espacios extra).
