# ApVet - Frontend (Tienda Online Veterinaria)

Este es el frontend de ApVet, una plataforma de venta de productos fitosanitarios y de uso veterinario exclusiva para profesionales. Desarrollado como Trabajo de Fin de Grado (TFG) de Grado Superior.

## Tecnologías principales

- **React 18** — Librería para la interfaz de usuario.
- **TypeScript** — Para añadir tipado estático y evitar errores en el código.
- **Vite** — Herramienta de compilación y servidor de desarrollo.
- **Tailwind CSS** — Framework de estilos CSS para un diseño ágil y moderno.
- **Lucide React** — Colección de iconos limpios y minimalistas.
- **React Router DOM** — Para gestionar la navegación entre las diferentes páginas.

## Cómo arrancar el proyecto

### 1. Instalar dependencias

Asegúrate de tener [Node.js](https://nodejs.org/) instalado. Luego, desde la carpeta `frontend/`:

```bash
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la carpeta `frontend/` (si no existe) y asegúrate de que apunta a tu backend:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Arrancar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 4. Construir para producción

```bash
npm run build
```

## Estructura del proyecto

Todo el código de la aplicación se encuentra en la carpeta `src/`:

- `components/` — Componentes reutilizables que forman la interfaz (Navbar, Footer, tarjetas de producto, paneles de administración...).
- `context/` — Estados globales de la aplicación, como `CartContext.tsx` para mantener los productos del carrito en toda la web.
- `hooks/` — Hooks personalizados como `useAuth.ts` para manejar el estado de la sesión del usuario.
- `pages/` — Las distintas pantallas de la web (Login, Catálogo, Perfil, Carrito, Sobre nosotros).
- `services/` — Archivos que concentran todas las llamadas a la API del backend (`userService`, `productService`, `orderService`).

## Funcionalidades principales

- **Catálogo de productos:** Listado con buscador en tiempo real, filtro por categorías y ordenación (por nombre o precio).
- **Carrito de compra:** Permite añadir productos, ajustar cantidades y confirmar el pedido. Aplica directamente el precio profesional.
- **Perfil de usuario:** El veterinario puede consultar y editar sus datos personales (teléfono, apodo, etc.) y modificar su contraseña de forma segura.
- **Panel de Administración (solo para Admin):**
  - **Gestión de productos:** Crear nuevos productos con subida de imagen y editar los existentes.
  - **Gestión de usuarios:** Crear cuentas para nuevos veterinarios (no hay registro público), consultar la lista de clientes y revisar los pedidos de cada uno.
  - **Gestión de pedidos:** Panel para visualizar los pedidos entrantes y cambiar su estado (Pendiente, En proceso, Historial). Incluye un contador de notificaciones de pedidos activos en el menú superior.

## Gestión de la Sesión y Seguridad

- **Rutas protegidas:** El componente `ProtectedRoute` bloquea el acceso a partes privadas de la aplicación y redirige al Login a los usuarios no autenticados o a aquellos que no tienen el rol necesario.
- **Persistencia:** El token JWT y los datos del usuario logueado se almacenan en `localStorage` para no perder la sesión al recargar la página.
