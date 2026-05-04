# Proyecto tienda online de productos fitosanitarios

Backend de una tienda online para la venta de productos fitosanitarios destinada a veterinarios. Está hecho con Flask y usa una base de datos MySQL que se levanta con Docker.

## Tecnologías utilizadas

- **Flask** — framework principal del backend
- **SQLAlchemy** — ORM para trabajar con la base de datos sin escribir SQL a mano
- **Flask-JWT-Extended** — para la autenticación con tokens JWT
- **Marshmallow** — serialización de los modelos (para que devuelvan JSON bonito)
- **bcrypt** — hasheo de contraseñas
- **Flask-CORS** 
- **MySQL 8.0**
- **Docker Compose**

## Cómo arrancar el proyecto

### 1. Levantar la base de datos

Hay que tener Docker instalado. Luego desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto levanta un contenedor de MySQL con la base de datos `veterinaria_db` ya creada, las tablas listas, los roles iniciales y un usuario admin por defecto (usa el archivo `database/init.sql`).

**Usuario admin por defecto:** `ADMIN001` / `admin123`

### 2. Instalar dependencias de Python

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

El archivo `.env` de la carpeta `backend/`:

```
FLASK_APP=src/app.py
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://vete_user:vete_password@localhost:3306/veterinaria_db
SECRET_KEY=tu-clave
JWT_SECRET_KEY=clave
```

### 4. Arrancar el servidor

```bash
python src/app.py
```

El servidor arranca en `http://127.0.0.1:5000`.

## Estructura

```
backend/
├── .env                          # Variables de entorno
├── requirements.txt              # Dependencias de Python
├── database/
│   └── init.sql                  # Script SQL para crear las tablas
└── src/
    ├── app.py                    # Configuración de Flask y punto de entrada
    ├── models/
    │   └── models.py             # Modelos de SQLAlchemy (las tablas)
    ├── schemas/
    │   └── schemas.py            # Esquemas de Marshmallow (serialización)
    └── routes/
        ├── __init__.py           # Registro de todos los Blueprints
        ├── auth_routes.py        # Login y registro
        ├── role_routes.py        # CRUD de roles
        ├── user_routes.py        # CRUD de usuarios
        ├── category_routes.py    # CRUD de categorías
        ├── product_routes.py     # CRUD de productos
        └── order_routes.py       # CRUD de pedidos
```

## Base de datos

La base de datos tiene las siguientes tablas:

- **roles** — los roles de usuario (admin y veterinario)
- **usuarios** — los usuarios registrados
- **categorias** — categorías de productos
- **productos** — los productos de la tienda
- **pedidos** — los pedidos que hacen los usuarios
- **detalle_pedido** — los productos de cada pedido con la cantidad y precio aplicado

### Roles

Solo hay dos roles:

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | admin | Puede gestionar todo: usuarios, productos, pedidos, etc. |
| 2 | veterinario | Usuario normal, puede hacer pedidos y ver sus datos |

## API REST — Endpoints

Todos los endpoints devuelven JSON. Los que tienen 🔒 requieren token JWT en la cabecera `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| POST | `/api/auth/register` | 🔒 (admin) | Crear un nuevo usuario (solo el admin puede) |
| POST | `/api/auth/login` | — | Iniciar sesión (devuelve el token JWT) |
| GET | `/api/auth/me` | 🔒 | Ver los datos del usuario que ha iniciado sesión |

#### Ejemplo de crear usuario (solo admin)

```json
POST /api/auth/register
Authorization: Bearer <token_del_admin>
{
    "nombre": "Juan",
    "apodo": "Juani",
    "telefono": "600123456",
    "password": "mipassword123",
    "num_colegiado": "VET-1234"
}
```

#### Ejemplo de login

```json
POST /api/auth/login
{
    "num_colegiado": "VET-1234",
    "password": "mipassword123"
}
```

Respuesta:

```json
{
    "message": "Login exitoso",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
}
```

### Roles (`/api/roles`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET | `/api/roles` | — | Ver todos los roles |
| GET | `/api/roles/<id>` | — | Ver un rol |
| POST | `/api/roles` | 🔒 | Crear un rol |
| PUT | `/api/roles/<id>` | 🔒 | Editar un rol |
| DELETE | `/api/roles/<id>` | 🔒 | Borrar un rol |

### Usuarios (`/api/users`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET | `/api/users` | 🔒 | Ver todos los usuarios |
| GET | `/api/users/<id>` | 🔒 | Ver un usuario |
| PUT | `/api/users/<id>` | 🔒 | Editar un usuario (solo el propio o si eres admin) |
| DELETE | `/api/users/<id>` | 🔒 | Borrar un usuario (solo admin) |

### Categorías (`/api/categories`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET | `/api/categories` | 🔒 | Ver todas las categorías |
| GET | `/api/categories/<id>` | 🔒 | Ver una categoría |
| POST | `/api/categories` | 🔒 | Crear una categoría |
| PUT | `/api/categories/<id>` | 🔒 | Editar una categoría |
| DELETE | `/api/categories/<id>` | 🔒 | Borrar una categoría (si no tiene productos) |

### Productos (`/api/products`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET | `/api/products` | 🔒 | Ver todos los productos (con paginación) |
| GET | `/api/products/<id>` | 🔒 | Ver un producto |
| POST | `/api/products` | 🔒 | Crear un producto |
| PUT | `/api/products/<id>` | 🔒 | Editar un producto |
| DELETE | `/api/products/<id>` | 🔒 | Borrar un producto |

El `GET /api/products` acepta estos query params para filtrar:

- `page` — número de página (por defecto 1)
- `per_page` — productos por página (por defecto 20)
- `categoria_id` — filtrar por categoría
- `search` — buscar por nombre
- `sort` — ordenar (nombre_asc, nombre_desc, precio_asc, precio_desc)

Ejemplo: `GET /api/products?search=collar&categoria_id=2&sort=precio_asc`

### Pedidos (`/api/orders`)

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET | `/api/orders` | 🔒 | Ver pedidos (los tuyos, o todos si eres admin) |
| GET | `/api/orders/<id>` | 🔒 | Ver un pedido con su detalle |
| POST | `/api/orders` | 🔒 | Crear un pedido |
| PUT | `/api/orders/<id>/status` | 🔒 | Cambiar estado del pedido (solo admin) |
| DELETE | `/api/orders/<id>` | 🔒 | Cancelar pedido (solo si está pendiente) |

#### Ejemplo de crear pedido

```json
POST /api/orders
{
    "items": [
        {"producto_id": 1, "cantidad": 2},
        {"producto_id": 3, "cantidad": 1}
    ]
}
```

El precio se aplica automáticamente usando `precio_profesional` ya que todos los usuarios son veterinarios. También comprueba que haya stock suficiente antes de crear el pedido.

## Seguridad

- **Solo veterinarios registrados** pueden acceder a la tienda. No hay registro público, el admin crea las cuentas
- Los productos y categorías **requieren autenticación** para poder verlos. Nadie sin cuenta puede ver nada
- Las contraseñas se guardan hasheadas con **bcrypt**, nunca en texto plano
- La autenticación usa **JWT** (JSON Web Tokens) con expiración de 24 horas
- Los endpoints protegidos devuelven un error 401 si no se envía un token válido
- Hay control de permisos: los veterinarios solo pueden ver y editar sus propios datos y pedidos, mientras que los admins tienen acceso a todo

## Notas

- Al cancelar un pedido se devuelve el stock de los productos
- No se puede borrar una categoría que tenga productos asociados
- Al levantar la base de datos por primera vez, se crean los roles (admin y veterinario) y un usuario admin automáticamente