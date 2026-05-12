-- ================================================================
-- Crystal Vanilla — Seed de usuarios
--
-- PASO PREVIO: Crear los usuarios en
-- Supabase Dashboard → Authentication → Users → Add User
--
--   Usuario 1 (Admin / Jefe):
--     Email:    aldogaya@crystalvanilla.com
--     Password: PUPANINA
--
--   Usuario 2 (Empleado):
--     Email:    eulaliolopez@crystalvanilla.com
--     Password: LALOVANILLA
--
-- Una vez creados, ejecutar este script.
-- ================================================================

-- ── Ver qué usuarios existen en Auth ────────────────────────────────────────
SELECT id, email FROM auth.users;

-- ── Insertar perfiles (si el trigger no los creó) ────────────────────────────

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT au.id, 'Aldo Gaya', 'AldoGaya2026', 'admin'
FROM auth.users au
WHERE au.email = 'aldogaya@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT au.id, 'Eulalio Lopez', 'EULALIO2026', 'empleado'
FROM auth.users au
WHERE au.email = 'eulaliolopez@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

-- ── Actualizar datos (por si el trigger los creó con username incorrecto) ────

UPDATE public.usuarios
SET nombre = 'Aldo Gaya', username = 'AldoGaya2026', rol = 'admin', activo = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'aldogaya@crystalvanilla.com';

UPDATE public.usuarios
SET nombre = 'Eulalio Lopez', username = 'EULALIO2026', rol = 'empleado', activo = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'eulaliolopez@crystalvanilla.com';

-- ── Verificar resultado ───────────────────────────────────────────────────────
SELECT u.nombre, u.username, u.rol, u.activo, au.email
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
ORDER BY u.rol DESC;
