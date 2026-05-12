-- ================================================================
-- Crystal Vanilla — RESET COMPLETO + SEED
-- Pega TODO en Supabase SQL Editor y ejecuta
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. Limpiar ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.logs     CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.almacen  CASCADE;

DELETE FROM auth.identities WHERE provider_id IN (
  'aldogaya@crystalvanilla.internal',
  'eulalio@crystalvanilla.internal'
);
DELETE FROM auth.users WHERE email IN (
  'aldogaya@crystalvanilla.internal',
  'eulalio@crystalvanilla.internal'
);

-- ── 2. Tablas ────────────────────────────────────────────────────────────────
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

CREATE TABLE public.almacen (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  identificador_almacen VARCHAR(50) NOT NULL DEFAULT 'Principal',
  paquetes_botellas     INTEGER     DEFAULT 0 CHECK (paquetes_botellas  >= 0),
  paquetes_charolas     INTEGER     DEFAULT 0 CHECK (paquetes_charolas  >= 0),
  paquetes_etiquetas    INTEGER     DEFAULT 0 CHECK (paquetes_etiquetas >= 0),
  paquetes_tapas        INTEGER     DEFAULT 0 CHECK (paquetes_tapas     >= 0),
  otros                 JSONB       DEFAULT '[]',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.logs (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  UUID         REFERENCES public.usuarios(id) ON DELETE SET NULL,
  accion      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha       TIMESTAMPTZ  DEFAULT now()
);

-- ── 3. Funciones y triggers ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER almacen_updated_at
  BEFORE UPDATE ON public.almacen FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin' AND activo = true);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT au.email FROM auth.users au
  INNER JOIN public.usuarios u ON u.id = au.id
  WHERE u.username = p_username LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, username, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre',   split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'empleado')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 4. Función crear_usuario (admin crea usuarios desde el panel) ─────────────
CREATE OR REPLACE FUNCTION public.crear_usuario(
  p_nombre   TEXT,
  p_username TEXT,
  p_password TEXT,
  p_rol      TEXT DEFAULT 'empleado'
)
RETURNS JSON AS $$
DECLARE
  new_uid   UUID := gen_random_uuid();
  new_email TEXT := lower(p_username) || '@crystalvanilla.internal';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado: solo admins pueden crear usuarios';
  END IF;
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE username = p_username) THEN
    RAISE EXCEPTION 'El username ya existe: %', p_username;
  END IF;
  IF p_rol NOT IN ('admin', 'empleado') THEN
    RAISE EXCEPTION 'Rol invalido: %', p_rol;
  END IF;

  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    new_email, crypt(p_password, gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('nombre', p_nombre, 'username', p_username, 'rol', p_rol),
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    new_uid, new_uid, new_email,
    json_build_object('sub', new_uid, 'email', new_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  INSERT INTO public.usuarios (id, nombre, username, rol, activo)
  VALUES (new_uid, p_nombre, p_username, p_rol, true)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre, username = EXCLUDED.username,
    rol = EXCLUDED.rol, activo = EXCLUDED.activo;

  RETURN json_build_object('id', new_uid, 'username', p_username, 'rol', p_rol);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.usuarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.almacen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select"         ON public.usuarios FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "usuarios_update_own"     ON public.usuarios FOR UPDATE      USING (auth.uid() = id);
CREATE POLICY "usuarios_update_admin"   ON public.usuarios FOR UPDATE      USING (public.is_admin());
CREATE POLICY "usuarios_insert_trigger" ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "usuarios_delete_admin"   ON public.usuarios FOR DELETE      USING (public.is_admin() AND id <> auth.uid());
CREATE POLICY "almacen_select"          ON public.almacen  FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "almacen_modify_admin"    ON public.almacen  FOR ALL         USING (public.is_admin());
CREATE POLICY "logs_select"             ON public.logs     FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "logs_insert"             ON public.logs     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── 6. Usuarios iniciales ─────────────────────────────────────────────────────
DO $$
DECLARE
  uid_admin UUID := gen_random_uuid();
  uid_emp   UUID := gen_random_uuid();
BEGIN
  -- Admin: AldoGaya2026 / PUPANINA
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (uid_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aldogaya@crystalvanilla.internal', crypt('PUPANINA', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Aldo Gaya","username":"AldoGaya2026","rol":"admin"}', now(), now(), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid_admin, uid_admin, 'aldogaya@crystalvanilla.internal', json_build_object('sub', uid_admin, 'email', 'aldogaya@crystalvanilla.internal', 'email_verified', true), 'email', now(), now(), now());
  INSERT INTO public.usuarios (id, nombre, username, rol, activo)
  VALUES (uid_admin, 'Aldo Gaya', 'AldoGaya2026', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET nombre=EXCLUDED.nombre, username=EXCLUDED.username, rol=EXCLUDED.rol, activo=EXCLUDED.activo;

  -- Empleado: EULALIO2026 / LALOVANILLA
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (uid_emp, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eulalio@crystalvanilla.internal', crypt('LALOVANILLA', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Eulalio Lopez","username":"EULALIO2026","rol":"empleado"}', now(), now(), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid_emp, uid_emp, 'eulalio@crystalvanilla.internal', json_build_object('sub', uid_emp, 'email', 'eulalio@crystalvanilla.internal', 'email_verified', true), 'email', now(), now(), now());
  INSERT INTO public.usuarios (id, nombre, username, rol, activo)
  VALUES (uid_emp, 'Eulalio Lopez', 'EULALIO2026', 'empleado', true)
  ON CONFLICT (id) DO UPDATE SET nombre=EXCLUDED.nombre, username=EXCLUDED.username, rol=EXCLUDED.rol, activo=EXCLUDED.activo;
END $$;

-- ── 7. Inventario inicial ─────────────────────────────────────────────────────
-- 400 paquetes × 200 botellas = 80,000 botellas
-- 800 paquetes × 20 charolas  = 16,000 charolas
-- 35 paquetes de tapas
-- 30 cajas de rollos de etiquetas
INSERT INTO public.almacen (identificador_almacen, paquetes_botellas, paquetes_charolas, paquetes_etiquetas, paquetes_tapas, otros)
VALUES ('Principal', 400, 800, 30, 35, '[]');

-- ── 8. Verificar ─────────────────────────────────────────────────────────────
SELECT u.nombre, u.username, u.rol, u.activo FROM public.usuarios u ORDER BY u.rol DESC;
SELECT identificador_almacen, paquetes_botellas, paquetes_charolas, paquetes_tapas, paquetes_etiquetas FROM public.almacen;
