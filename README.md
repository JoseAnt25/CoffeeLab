# CoffeLab 

Tienda online de café de especialidad desarrollada con **Laravel** (backend API REST) y **Angular** (frontend). Gestiona productos con variantes e imágenes, pedidos con seguimiento de estado, usuarios con roles y un panel de administración completo.

---

## Estructura del proyecto

```
CoffeeLab/
├── backend/
│   ├── docker/
│   │   └── php/
│   │       └── Dockerfile
│   ├── src/                  # Proyecto Laravel
│   ├── docker-compose.yml
│   └── README.md
└── frontend/                 # Proyecto Angular
    ├── src/
    │   ├── app/
    │   │   ├── guards/
    │   │   ├── interceptors/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   └── shared/
    │   └── styles.css
    └── angular.json
```

---

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop) y Docker Compose
- [Node.js](https://nodejs.org/) v18 o superior

---

## Backend (Laravel)

### 1. Configurar el `.env`

Copia el archivo de ejemplo y configúralo:

```bash
cp src/.env.example src/.env
```

Asegúrate de que el `.env` tenga estos valores:

```env
APP_NAME=CoffeLab
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravel_pass

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=localhost

CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### 2. Levantar los contenedores

```bash
docker compose up -d --build
```

Esto levanta dos servicios:
- `CoffeLab-app` — PHP 8.4 con Laravel en el puerto `8000`
- `CoffeLab-db` — MySQL 8.0 en el puerto `3307`

### 3. Instalar dependencias

```bash
docker exec -it CoffeLab-app composer install
```

### 4. Generar la app key

```bash
docker exec -it CoffeLab-app php artisan key:generate
```

### 5. Ejecutar migraciones y seeders

```bash
docker exec -it CoffeLab-app php artisan migrate
docker exec -it CoffeLab-app php artisan db:seed
```

### 6. Crear enlace de storage

```bash
docker exec -it CoffeLab-app php artisan storage:link
```

El backend estará disponible en **http://localhost:8000**

---

## Frontend (Angular)

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Arrancar el servidor de desarrollo

```bash
npm start
```

El frontend estará disponible en **http://localhost:4200**

---

## Usuarios de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@coffelab.com | password123 | admin |
| cliente@coffelab.com | password123 | cliente |

---

## API REST

### Rutas públicas

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/register` | Registro de usuario |
| POST | `/api/login` | Login |
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/{id}` | Detalle de producto |
| GET | `/api/categorias` | Listar categorías |
| GET | `/api/categorias/{id}` | Detalle de categoría |

### Rutas protegidas (requieren token)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/me` | Datos del usuario autenticado |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/{id}` | Editar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |
| POST | `/api/categorias` | Crear categoría |
| PUT | `/api/categorias/{id}` | Editar categoría |
| DELETE | `/api/categorias/{id}` | Eliminar categoría |
| GET | `/api/pedidos` | Listar pedidos |
| POST | `/api/pedidos` | Crear pedido |
| GET | `/api/pedidos/{id}` | Detalle de pedido |
| PUT | `/api/pedidos/{id}` | Cambiar estado de pedido |
| DELETE | `/api/pedidos/{id}` | Eliminar pedido |

---

## Base de datos

### Tablas

| Tabla | Descripción |
|---|---|
| `usuarios` | Clientes y administradores de la tienda |
| `categorias` | Agrupación de productos (café, cafeteras, accesorios) |
| `productos` | Catálogo de productos con precio, stock e imagen |
| `variantes_producto` | Variantes por producto (tamaño, color, etc.) con modificador de precio |
| `pedidos` | Pedidos realizados por los usuarios con seguimiento de estado |
| `items_pedido` | Líneas de cada pedido con precio unitario en el momento de la compra |
| `personal_access_tokens` | Tokens de autenticación Sanctum |

### Estados de un pedido

`pendiente` → `pagado` → `enviado` → `entregado` / `cancelado`

### Roles de usuario

- `cliente` — rol por defecto
- `admin` — acceso al panel de administración

---

## Frontend — Páginas

| Ruta | Descripción | Protegida |
|---|---|---|
| `/` | Inicio con historia y productos destacados | No |
| `/catalogo` | Catálogo con filtros por categoría | No |
| `/catalogo/:id` | Detalle de producto con variantes y carrito | No |
| `/carrito` | Página del carrito | No |
| `/checkout` | Finalizar pedido | Sí (auth) |
| `/login` | Inicio de sesión | No |
| `/register` | Registro de usuario | No |
| `/mi-cuenta` | Historial de pedidos del usuario | Sí (auth) |
| `/admin` | Panel de administración | Sí (admin) |
| `/admin/productos` | Gestión de productos | Sí (admin) |
| `/admin/pedidos` | Gestión de pedidos | Sí (admin) |

---

## Frontend — Servicios

| Servicio | Descripción |
|---|---|
| `AuthService` | Login, register, logout, signals de usuario |
| `ProductoService` | CRUD de productos y subida de imágenes |
| `CategoriaService` | CRUD de categorías |
| `PedidoService` | Crear y gestionar pedidos |
| `CarritoService` | Carrito en memoria con signals |

---

## Comandos útiles

```bash
# Levantar contenedores
docker compose up -d

# Parar contenedores
docker compose down

# Entrar al contenedor de la app
docker exec -it CoffeLab-app bash

# Resetear BD y seeders
docker exec -it CoffeLab-app php artisan db:wipe && php artisan migrate && php artisan db:seed

# Limpiar caché
docker exec -it CoffeLab-app php artisan config:clear
docker exec -it CoffeLab-app php artisan cache:clear

# Borrar BD y volúmenes completamente
docker compose down -v
```

---

## Docker Compose

| Servicio | Imagen | Puerto |
|---|---|---|
| app | php:8.4-cli-alpine + Composer 2 | 8000 |
| db | mysql:8.0 | 3307 → 3306 |

Las imágenes de productos se almacenan en `backend/src/storage/app/public/productos` y se sirven desde `http://localhost:8000/storage/productos/`.