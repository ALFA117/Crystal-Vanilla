# Manual Técnico — Crystal Vanilla

## 1. Descripción general

**Crystal Vanilla** es una aplicación web (SPA) desarrollada para apoyar la producción y el control de inventario de la empresa. Incluye:

- Una **calculadora de producción** (litros / tiendas → cajas, botellas, etiquetas).
- Exportación de resultados a **PDF**.
- Un **panel administrativo / inventario** con autenticación de usuarios (rol *admin* / *empleado*), control de almacén, registro de actividad (logs) y gestión de usuarios.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 |
| Animaciones | Framer Motion |
| Fondo animado | tsParticles |
| Generación de PDF | jsPDF |
| Backend / Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |
| Control de versiones | GitHub (`github.com/ALFA117/Crystal-Vanilla`) |

---

## 3. Estructura del proyecto

```
src/
├── App.jsx                  # Componente raíz, navegación (Calculadora / Inventario)
├── App.css                  # Estilos globales (incluye dashboard, modal, topnav)
├── main.jsx                 # Punto de entrada de React
├── components/
│   ├── Header.jsx            # Encabezado + botón Ingresar / panel de usuario
│   ├── ModeSelector.jsx       # Selector de modo (litros / tiendas)
│   ├── InputSection.jsx       # Captura de valor + validaciones
│   ├── ResultsGrid.jsx        # Tarjetas de resultados
│   ├── ResultCard.jsx         # Tarjeta individual
│   ├── ParticlesBackground.jsx
│   ├── Footer.jsx
│   ├── auth/
│   │   └── LoginModal.jsx      # Modal de inicio de sesión (usuario + contraseña)
│   └── dashboard/
│       ├── DashboardPage.jsx    # Panel principal (resumen + tabs admin)
│       ├── InventoryPanel.jsx   # Inventario editable (admin) / solo lectura (empleado)
│       ├── LogsPanel.jsx        # Historial de actividad
│       ├── UserManagement.jsx   # Alta de usuarios y gestión de roles
│       └── ChangePassword.jsx   # Cambio de contraseña propio
├── contexts/
│   └── AuthContext.jsx        # Sesión, perfil, login/logout, isAdmin
├── services/
│   └── supabase.js            # Cliente Supabase + funciones de acceso a datos
├── utils/
│   ├── calculations.js        # Lógica de negocio (cálculo de producción)
│   └── pdfExport.js            # Generación del PDF de resultados
└── hooks/
    └── useAnimatedCounter.js

database/
└── reset_completo.sql         # Script único de creación/reseteo de la base de datos
```

---

## 4. Lógica de cálculo (`src/utils/calculations.js`)

### Unidades de referencia
- 1 tienda = 11 cajas = 110 litros = 220 botellas
- 1 caja = 10 litros = 20 botellas
- 1 paquete de cajas = 20 cajas
- 1 paquete de charolas = 20 charolas
- 1 bolsa de botellas = 200 botellas
- 1 rollo de etiquetas = 1,000 etiquetas
- 1 caja de rollos = 9 rollos = 9,000 etiquetas

### Modos
- **Modo "litros"**: el usuario ingresa litros disponibles (mínimo 110).
  - `tiendasCompletas = floor(litros / 110)` → tiendas que se pueden producir completas con lo disponible.
  - `litrosSobrantes = litros - tiendasCompletas * 110` → litros que sobran para una tienda parcial.
  - Las cajas/botellas/etiquetas totales se calculan sobre `tiendasCompletas` (no se redondea hacia arriba), evitando prometer producción que no es posible con el litraje real.
  - Si hay sobrante, se calcula además cuántas cajas/botellas de la "tienda parcial" ya se cubren y cuántas faltan para completarla.
- **Modo "tiendas"**: el usuario ingresa directamente el número de tiendas a producir (`Math.ceil`).

### Validación
- En modo litros, el valor mínimo aceptado es **110 litros** (equivalente a 1 tienda). Valores menores muestran el mensaje: *"Mínimo 110 litros — eso equivale a 1 tienda completa"* (`InputSection.jsx`).

---

## 5. Exportación a PDF (`src/utils/pdfExport.js`)

- Generado manualmente con **jsPDF** (sin captura de pantalla / html2canvas), por lo que es liviano y nítido.
- Incluye tarjetas con: tiendas completas, extracto disponible, cajas y botellas totales (con desglose de la tienda parcial cuando aplica), y etiquetas.
- La función `safe()` elimina emojis del texto, ya que la fuente Helvetica no los soporta.

---

## 6. Autenticación y roles

### Funcionamiento
- Supabase Auth requiere un correo, pero el sistema **no usa correos reales**: cada usuario tiene un *username* que internamente se mapea a `usuario@crystalvanilla.internal`.
- El login (`LoginModal.jsx`) solo pide **usuario** y **contraseña**.
- `AuthContext.jsx` mantiene la sesión (`user`), el perfil (`perfil`, tabla `usuarios`) y expone `isAdmin`, `login`, `logout`.

### Roles
- **admin**: acceso total — inventario editable, actividad (logs), gestión de usuarios, cambio de contraseña.
- **empleado**: solo ve el resumen de inventario (tarjetas + "Otros") y puede cambiar su propia contraseña. No ve las pestañas de Inventario/Actividad/Usuarios.

### Usuarios iniciales (creados por `database/reset_completo.sql`)
| Rol | Usuario | Contraseña |
|---|---|---|
| admin | `AldoGaya2026` | `PUPANINA` |
| empleado | `EULALIO2026` | `LALOVANILLA` |

> ⚠️ Se recomienda cambiar estas contraseñas desde el panel ("🔑 Contraseña") al recibir el proyecto.

---

## 7. Base de datos (Supabase / PostgreSQL)

Toda la base de datos se crea/reinicia con un solo script: **`database/reset_completo.sql`**. Este script:

1. Elimina y recrea las tablas: `usuarios`, `almacen`, `logs`.
2. Crea funciones auxiliares:
   - `is_admin()` — valida si el usuario autenticado es admin (usado por las políticas RLS sin causar recursión).
   - `get_email_by_username(username)` — traduce usuario → correo interno para el login.
   - `handle_new_user()` — trigger que crea el perfil en `usuarios` cuando se crea un usuario en `auth.users`.
   - `crear_usuario(nombre, username, password, rol)` — función `SECURITY DEFINER` que permite a un admin crear usuarios nuevos (en `auth.users`, `auth.identities` y `usuarios`) **sin necesitar el panel de Supabase**.
3. Configura **RLS (Row Level Security)** en las 3 tablas, con políticas según el rol.
4. Inserta los 2 usuarios iniciales (admin y empleado) directamente en `auth.users`/`auth.identities` usando `pgcrypto` (`crypt(password, gen_salt('bf'))`).
5. Inserta el registro inicial de `almacen` (inventario "Principal"):
   - 400 paquetes de botellas (×200 = 80,000 botellas)
   - 800 paquetes de charolas (×20 = 16,000 charolas)
   - 35 cajas de tapas
   - 30 cajas de rollos de etiquetas
   - Campo `otros` (JSONB) vacío `[]` para artículos adicionales libres.

### Tablas

**`usuarios`**
| Campo | Descripción |
|---|---|
| `id` | UUID, referencia a `auth.users` |
| `nombre` | Nombre completo |
| `username` | Nombre de usuario (login) |
| `rol` | `admin` \| `empleado` |
| `activo` | Booleano (permite desactivar usuarios) |

**`almacen`**
| Campo | Descripción |
|---|---|
| `id` | Identificador |
| `identificador_almacen` | Nombre del almacén (ej. "Principal") |
| `paquetes_botellas` | Paquetes de botellas (×200 c/u) |
| `paquetes_charolas` | Paquetes de charolas (×20 c/u) |
| `paquetes_tapas` | Cajas de tapas |
| `paquetes_etiquetas` | Cajas de rollos de etiquetas |
| `otros` | JSONB — lista libre de artículos extra `{id, nombre, cantidad, unidad}` |
| `updated_at` | Última actualización |

**`logs`**
| Campo | Descripción |
|---|---|
| `id` | Identificador |
| `usuario_id` | Quién realizó la acción |
| `accion` | Tipo de acción (ej. `modificacion_inventario`, `cambio_password`, `crear_usuario`) |
| `descripcion` | Detalle de la acción |
| `created_at` | Fecha y hora |

---

## 8. Variables de entorno

El proyecto requiere un archivo `.env` (no incluido en el repositorio por seguridad) con:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<clave-publica-anon>
```

- Estas variables deben configurarse también en **Vercel** (Project Settings → Environment Variables) para que el deploy en producción funcione.
- Si no están configuradas, el cliente de Supabase no se inicializa (`services/supabase.js` lo maneja con un guard para evitar pantalla en blanco), pero el login y el panel no funcionarán.

---

## 9. Despliegue

- **Hosting**: Vercel, conectado al repositorio de GitHub (`ALFA117/Crystal-Vanilla`, rama `main`).
- Cada `git push` a `main` dispara un nuevo deploy automático en Vercel.
- `vite.config.js` no define `base` (no se usa GitHub Pages); Vercel sirve la app desde la raíz `/`.
- Existe también un workflow de GitHub Actions (`.github/workflows/deploy.yml`) preparado para GitHub Pages con Node 22, pero **no es el método de despliegue activo** (se deja como referencia, no afecta el deploy de Vercel).

### Pasos para correr localmente
```bash
npm install
npm run dev      # entorno de desarrollo
npm run build    # genera carpeta dist/ para producción
npm run preview  # sirve la build de producción localmente
```

---

## 10. Mantenimiento / cómo extender el proyecto

- **Agregar un nuevo tipo de inventario fijo**: añadir un campo en la tabla `almacen` (SQL) y agregar la entrada correspondiente en `ITEMS` (`InventoryPanel.jsx`) y `SUMMARY_ITEMS` (`DashboardPage.jsx`).
- **Artículos variables**: usar la sección "Otros" (campo JSONB `almacen.otros`), no requiere cambios de esquema.
- **Nuevos usuarios**: desde el panel de administración → pestaña "👥 Usuarios" → "➕ Nuevo usuario" (usa la función SQL `crear_usuario`).
- **Reiniciar la base de datos por completo**: ejecutar `database/reset_completo.sql` en el editor SQL de Supabase. ⚠️ Esto borra todos los datos existentes.

---

## 11. Repositorio y accesos

- Repositorio: `https://github.com/ALFA117/Crystal-Vanilla`
- Supabase Project URL: `https://ebfyaugtovnbgcvbscjm.supabase.co`
- Hosting: Vercel (vinculado al repositorio anterior)

> Se recomienda transferir la propiedad del repositorio de GitHub, el proyecto de Vercel y el proyecto de Supabase a una cuenta controlada por la empresa, y cambiar las contraseñas de los usuarios iniciales.
