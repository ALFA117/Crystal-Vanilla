-- ================================================================
-- Crystal Vanilla — Seed de usuarios
--
-- ANTES de ejecutar este script debes crear los usuarios en:
-- Supabase Dashboard → Authentication → Users → Add User
--
-- Usuario 1 (Jefe / Admin):
--   Email:    aldogaya@crystalvanilla.com
--   Password: PUPANINA
--
-- Usuario 2 (Empleado de ejemplo):
--   Email:    carlos@crystalvanilla.com
--   Password: Empleado2024
-- ================================================================

-- ── Paso 1: Confirmar que el trigger creó los perfiles ───────────────────────
-- (El trigger on_auth_user_created lo hace automáticamente al crear el usuario)
-- Si por algún motivo no se crearon, este INSERT los crea manualmente:

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT
  au.id,
  'Aldo Gaya',
  'aldogaya',
  'admin'
FROM auth.users au
WHERE au.email = 'aldogaya@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT
  au.id,
  'Carlos Lopez',
  'carlos',
  'empleado'
FROM auth.users au
WHERE au.email = 'carlos@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

-- ── Paso 2: Actualizar perfiles con datos correctos ──────────────────────────

-- Aldo Gaya → Admin (jefe de la empresa)
UPDATE public.usuarios
SET
  nombre   = 'Aldo Gaya',
  username = 'aldogaya',
  rol      = 'admin',
  activo   = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'aldogaya@crystalvanilla.com';

-- Carlos López → Empleado (ejemplo de trabajador)
UPDATE public.usuarios
SET
  nombre   = 'Carlos Lopez',
  username = 'carlos',
  rol      = 'empleado',
  activo   = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'carlos@crystalvanilla.com';

-- ── Verificar resultado ───────────────────────────────────────────────────────
SELECT
  u.nombre,
  u.username,
  u.rol,
  u.activo,
  au.email
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
ORDER BY u.rol DESC;  -- admins primero
