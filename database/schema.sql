-- ================================================================
-- Crystal Vanilla — Schema completo para Supabase
-- Pegar y ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================================

-- ── 1. Tabla de perfiles de usuario ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios (
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

-- ── 2. Tabla de almacén ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.almacen (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  identificador_almacen VARCHAR(50)  NOT NULL DEFAULT 'Principal',
  paquetes_botellas     INTEGER      DEFAULT 0 CHECK (paquetes_botellas >= 0),
  paquetes_charolas     INTEGER      DEFAULT 0 CHECK (paquetes_charolas >= 0),
  paquetes_etiquetas    INTEGER      DEFAULT 0 CHECK (paquetes_etiquetas >= 0),
  paquetes_tapas        INTEGER      DEFAULT 0 CHECK (paquetes_tapas >= 0),
  otros                 JSONB        DEFAULT '{}',
  created_at            TIMESTAMPTZ  DEFAULT now(),
  updated_at            TIMESTAMPTZ  DEFAULT now()
);

-- ── 3. Tabla de logs de actividad ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  UUID        REFERENCES public.usuarios(id) ON DELETE SET NULL,
  accion      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha       TIMESTAMPTZ  DEFAULT now()
);

-- ── 4. Función helper: verificar si usuario actual es admin ──────────────────
-- Usa SECURITY DEFINER para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin' AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 5. Función: obtener email por username (login con username) ──────────────
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT au.email
  FROM auth.users au
  INNER JOIN public.usuarios u ON u.id = au.id
  WHERE u.username = p_username
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 6. Función: crear perfil automáticamente al registrarse ──────────────────
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

-- ── 7. Función: actualizar updated_at automáticamente ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS almacen_updated_at  ON public.almacen;
DROP TRIGGER IF EXISTS usuarios_updated_at ON public.usuarios;

CREATE TRIGGER almacen_updated_at
  BEFORE UPDATE ON public.almacen
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 8. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.usuarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.almacen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs      ENABLE ROW LEVEL SECURITY;

-- USUARIOS
DROP POLICY IF EXISTS "usuarios_select"        ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own"    ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_admin"  ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_admin"  ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_admin"  ON public.usuarios;

CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "usuarios_update_admin" ON public.usuarios
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "usuarios_insert_trigger" ON public.usuarios
  FOR INSERT WITH CHECK (true);  -- el trigger lo maneja con SECURITY DEFINER

CREATE POLICY "usuarios_delete_admin" ON public.usuarios
  FOR DELETE USING (public.is_admin() AND id <> auth.uid());

-- ALMACEN
DROP POLICY IF EXISTS "almacen_select"       ON public.almacen;
DROP POLICY IF EXISTS "almacen_modify_admin" ON public.almacen;

CREATE POLICY "almacen_select" ON public.almacen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "almacen_modify_admin" ON public.almacen
  FOR ALL USING (public.is_admin());

-- LOGS
DROP POLICY IF EXISTS "logs_select" ON public.logs;
DROP POLICY IF EXISTS "logs_insert" ON public.logs;

CREATE POLICY "logs_select" ON public.logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "logs_insert" ON public.logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── 9. Datos iniciales ────────────────────────────────────────────────────────
INSERT INTO public.almacen (identificador_almacen, paquetes_botellas, paquetes_charolas, paquetes_etiquetas, paquetes_tapas)
VALUES ('Principal', 400, 800, 30, 30)
ON CONFLICT DO NOTHING;

-- ── 10. INSTRUCCIONES USUARIO INICIAL (Aldo Gaya) ────────────────────────────
--
--  PASO 1: Ir a Supabase Dashboard → Authentication → Users → Add User
--  PASO 2: Email: aldogaya@crystalvanilla.com  |  Password: PUPANINA
--  PASO 3: Después de crearlo, ejecutar este UPDATE:
--
--    UPDATE public.usuarios
--    SET nombre = 'Aldo Gaya', username = 'aldogaya', rol = 'admin'
--    FROM auth.users au
--    WHERE usuarios.id = au.id
--      AND au.email = 'aldogaya@crystalvanilla.com';
--
-- ─────────────────────────────────────────────────────────────────────────────
