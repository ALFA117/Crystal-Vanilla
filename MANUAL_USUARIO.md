# Manual de Usuario — Crystal Vanilla

## 1. ¿Qué es Crystal Vanilla?

Crystal Vanilla es la herramienta web para:

1. **Calcular la producción** necesaria (cajas, botellas, etiquetas) a partir de los litros disponibles o el número de tiendas a abastecer.
2. **Consultar y administrar el inventario** del almacén (botellas, charolas, tapas, etiquetas y otros artículos).

---

## 2. Pantalla principal — Calculadora

1. Elige el modo de cálculo en la parte superior:
   - **Litros**: ingresa los litros de extracto disponibles.
   - **Tiendas**: ingresa el número de tiendas que quieres producir.
2. Escribe el valor y presiona **Calcular**.
3. Se mostrarán tarjetas con los resultados:
   - **🏪 Tiendas**: cuántas tiendas completas se pueden producir, y si sobran litros, cuánto falta para completar la siguiente tienda.
   - **Extracto**: litros disponibles, y si aplican, cuántos litros faltan o si es exacto.
   - **Cajas / Botellas**: totales necesarios, y el detalle de la "tienda parcial" (lo que ya tienes y lo que falta).
   - **Etiquetas**: rollos/cajas necesarios.

### Validación
- En modo **Litros**, el valor mínimo es **110 litros** (1 tienda completa). Si ingresas menos, el sistema te avisa: *"Mínimo 110 litros — eso equivale a 1 tienda completa"*.

### Descargar PDF
- En los resultados, presiona **"📄 Descargar PDF"** para obtener un reporte imprimible con todos los cálculos.

---

## 3. Acceso al sistema (Iniciar sesión)

1. En la esquina superior derecha presiona **"🔐 Ingresar"**.
2. Ingresa tu **usuario** y **contraseña** (proporcionados por el administrador).
3. Una vez dentro, el botón cambiará para mostrar tu nombre y rol (`admin` o `empleado`).

### Usuarios de ejemplo (deben cambiarse al recibir el sistema)
| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `AldoGaya2026` | `PUPANINA` |
| Empleado | `EULALIO2026` | `LALOVANILLA` |

---

## 4. Barra de navegación

En la parte superior, debajo del encabezado, hay dos botones:
- **📊 Calculadora**: regresa a la pantalla principal de cálculo.
- **📦 Inventario / Panel Admin**: abre el panel de inventario (si no has iniciado sesión, primero te pedirá tus datos de acceso).

---

## 5. Panel de Inventario — vista de Empleado

Al entrar al panel, un **empleado** verá:

1. **Tarjetas de resumen**: cantidades actuales de Paquetes de Botellas, Paquetes de Charolas, Cajas de Tapas y Cajas de Etiquetas.
2. **Otros artículos** (si existen): lista de artículos adicionales registrados por el administrador (ej. "Botes de extracto").
3. **🔑 Contraseña**: formulario para cambiar tu propia contraseña.

Los empleados **no pueden editar** el inventario ni ver el historial de actividad o la lista de usuarios.

---

## 6. Panel de Inventario — vista de Administrador

El administrador ve, además del resumen, las siguientes pestañas:

### 📦 Inventario
- Muestra las cantidades actuales de:
  - Paquetes de Botellas (1 paquete = 200 botellas)
  - Paquetes de Charolas (1 paquete = 20 charolas)
  - Cajas de Tapas
  - Cajas de Rollos de Etiquetas
- Presiona **"✏️ Editar"** para modificar cantidades.
- En la sección **"Otros artículos"** puedes:
  - Agregar artículos libres (nombre, cantidad y unidad) — por ejemplo "Botes de extracto: 20 botes".
  - Editar la cantidad de un artículo existente.
  - Eliminar un artículo con el botón **✕**.
- Presiona **"💾 Guardar"** para confirmar los cambios, o **✕** para cancelar.

### 📋 Actividad
- Muestra un historial de las acciones realizadas en el sistema (cambios de inventario, cambios de contraseña, creación de usuarios, etc.), con fecha y quién las realizó.

### 👥 Usuarios
- Lista de todos los usuarios del sistema, con su rol y estado (activo/inactivo).
- Permite **activar/desactivar** usuarios y **cambiar su rol** (admin ↔ empleado).
- Botón **"➕ Nuevo usuario"**: abre un formulario para crear un usuario nuevo:
  - Nombre completo
  - Nombre de usuario (para iniciar sesión)
  - Contraseña y confirmación
  - Rol (admin o empleado)

### 🔑 Contraseña
- El administrador también puede cambiar su propia contraseña aquí.

---

## 7. Cerrar sesión

Dentro del panel, presiona **"🚪 Salir"** para cerrar tu sesión y volver a la calculadora.

---

## 8. Preguntas frecuentes

**¿Qué hago si olvidé mi contraseña?**
Solicita al administrador del sistema (rol *admin*) que ingrese a "👥 Usuarios" y, si es necesario, cree un nuevo usuario o te ayude a restablecer el acceso.

**¿Por qué no veo las pestañas de Inventario/Actividad/Usuarios?**
Esas secciones solo están disponibles para usuarios con rol **administrador**. Los empleados solo ven el resumen de inventario.

**¿El PDF que descargo refleja el inventario real?**
No. El PDF es un **reporte de cálculo** (cuántas cajas/botellas/etiquetas se necesitan para la producción solicitada), no el inventario actual del almacén. Para ver el inventario, usa el panel "📦 Inventario".
