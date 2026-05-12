-- ================================================================
-- Crystal Vanilla — RESET COMPLETO + SEED
-- Pega TODO esto en Supabase SQL Editor y ejecuta
-- ================================================================

-- ── 0. Extensiones ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. Borrar tablas y usuarios anteriores ───────────────────────────────────
DROP TABLE IF EXISTS public.logs     CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.almacen  CASCADE;

-- Borrar solo los usuarios internos de esta app
DELETE FROM auth.identities
WHERE provider_id IN (
  'aldogaya@crystalvanilla.internal',
  'eulalio@crystalvanilla.internal'
);
DELETE FROM auth.users
WHERE email IN (
  'aldogaya@crystalvanilla.internal',
  'eulalio@crystalvanilla.internal'
);

-- ── 2. Tabla usuarios ────────────────────────────────────────────────────────
CREATE TABLE public.usuarios (
  id           UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  rol          VARCHAR(20)  NOT NULL DEFAULT 'empleado'
                            CHECK (rol IN ('admin', 'empleado')),
  activo       BOOLEAN      DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  DEFAULT now(),
  updated_at   TIMESTAMPTZ  DEFAULT now()
);

-- ── 3. Tabla almacen ─────────────────────────────────────────────────────────
CREATE TABLE public.almacen (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  identificador_almacen VARCHAR(50) NOT NULL DEFAULT 'Principal',
  paquetes_botellas     INTEGER     DEFAULT 0 CHECK (paquetes_botellas  >= 0),
  paquetes_charolas     INTEGER     DEFAULT 0 CHECK (paquetes_charolas  >= 0),
  paquetes_etiquetas    INTEGER     DEFAULT 0 CHECK (paquetes_etiquetas >= 0),
  paquetes_tapas        INTEGER     DEFAULT 0 CHECK (paquetes_tapas     >= 0),
  otros                 JSONB       DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Tabla logs ────────────────────────────────────────────────────────────
CREATE TABLE public.logs (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  UUID         REFERENCES public.usuarios(id) ON DELETE SET NULL,
  accion      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha       TIMESTAMPTZ  DEFAULT now()
);

-- ── 5. Funciones ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER almacen_updated_at
  BEFORE UPDATE ON public.almacen
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Función para verificar si el usuario actual es admin (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin' AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función para login con username (traduce username → email interno)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT au.email
  FROM auth.users au
  INNER JOIN public.usuarios u ON u.id = au.id
  WHERE u.username = p_username
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger: auto-crear perfil al registrar usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, username, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre',   split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'empleado')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 6. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.usuarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.almacen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select"          ON public.usuarios FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "usuarios_update_own"      ON public.usuarios FOR UPDATE      USING (auth.uid() = id);
CREATE POLICY "usuarios_update_admin"    ON public.usuarios FOR UPDATE      USING (public.is_admin());
CREATE POLICY "usuarios_insert_trigger"  ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "usuarios_delete_admin"    ON public.usuarios FOR DELETE      USING (public.is_admin() AND id <> auth.uid());

CREATE POLICY "almacen_select"           ON public.almacen  FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "almacen_modify_admin"     ON public.almacen  FOR ALL         USING (public.is_admin());

CREATE POLICY "logs_select"              ON public.logs     FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "logs_insert"              ON public.logs     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── 7. Crear usuarios auth + perfiles ────────────────────────────────────────
DO $$
DECLARE
  uid_admin UUID := gen_random_uuid();
  uid_emp   UUID := gen_random_uuid();
BEGIN

  -- ── Admin: AldoGaya2026 / PUPANINA ───────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    uid_admin,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'aldogaya@crystalvanilla.internal',
    crypt('PUPANINA', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre":"Aldo Gaya","username":"AldoGaya2026","rol":"admin"}',
    now(), now(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    uid_admin, uid_admin,
    'aldogaya@crystalvanilla.internal',
    json_build_object('sub', uid_admin, 'email', 'aldogaya@crystalvanilla.internal', 'email_verified', true),
    'email', now(), now(), now()
  );

  INSERT INTO public.usuarios (id, nombre, username, rol, activo)
  VALUES (uid_admin, 'Aldo Gaya', 'AldoGaya2026', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre, username = EXCLUDED.username,
    rol = EXCLUDED.rol, activo = EXCLUDED.activo;

  -- ── Empleado: EULALIO2026 / LALOVANILLA ──────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    uid_emp,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'eulalio@crystalvanilla.internal',
    crypt('LALOVANILLA', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre":"Eulalio Lopez","username":"EULALIO2026","rol":"empleado"}',
    now(), now(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    uid_emp, uid_emp,
    'eulalio@crystalvanilla.internal',
    json_build_object('sub', uid_emp, 'email', 'eulalio@crystalvanilla.internal', 'email_verified', true),
    'email', now(), now(), now()
  );

  INSERT INTO public.usuarios (id, nombre, username, rol, activo)
  VALUES (uid_emp, 'Eulalio Lopez', 'EULALIO2026', 'empleado', true)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre, username = EXCLUDED.username,
    rol = EXCLUDED.rol, activo = EXCLUDED.activo;

END $$;

-- ── 8. Inventario inicial ────────────────────────────────────────────────────
INSERT INTO public.almacen (identificador_almacen, paquetes_botellas, paquetes_charolas, paquetes_etiquetas, paquetes_tapas)
VALUES ('Principal', 400, 800, 30, 30);

-- ── 9. Verificar resultado ───────────────────────────────────────────────────
SELECT u.nombre, u.username, u.rol, u.activo, au.email
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
ORDER BY u.rol DESC;

SELECT identificador_almacen, paquetes_botellas, paquetes_charolas, paquetes_etiquetas, paquetes_tapas
FROM public.almacen;
