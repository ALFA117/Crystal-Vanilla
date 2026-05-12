-- ================================================================
-- Crystal Vanilla — Seed de usuarios
--
-- PASO PREVIO OBLIGATORIO:
-- Crear los usuarios en Supabase Dashboard → Authentication → Users → Add User
--
--   Usuario 1 (Admin):
--     Email:    aldogaya@crystalvanilla.com
--     Password: PUPANINA
--
--   Usuario 2 (Empleado):
--     Email:    eulaliolopez@crystalvanilla.com
--     Password: Empleado2024
--
-- Una vez creados, ejecutar este script completo.
-- ================================================================

-- ── Diagnóstico: ver qué usuarios existen en Auth ────────────────────────────
SELECT id, email FROM auth.users;

-- ── Insertar perfiles (si el trigger no los creó automáticamente) ────────────

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT au.id, 'Aldo Gaya', 'aldogaya', 'admin'
FROM auth.users au
WHERE au.email = 'aldogaya@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, nombre, username, rol)
SELECT au.id, 'Eulalio Lopez', 'eulalio', 'empleado'
FROM auth.users au
WHERE au.email = 'eulaliolopez@crystalvanilla.com'
ON CONFLICT (id) DO NOTHING;

-- ── Actualizar datos correctos ───────────────────────────────────────────────

UPDATE public.usuarios
SET nombre = 'Aldo Gaya', username = 'aldogaya', rol = 'admin', activo = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'aldogaya@crystalvanilla.com';

UPDATE public.usuarios
SET nombre = 'Eulalio Lopez', username = 'eulalio', rol = 'empleado', activo = true
FROM auth.users au
WHERE public.usuarios.id = au.id
  AND au.email = 'eulaliolopez@crystalvanilla.com';

-- ── Verificar resultado ───────────────────────────────────────────────────────
SELECT u.nombre, u.username, u.rol, u.activo, au.email
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
ORDER BY u.rol DESC;
