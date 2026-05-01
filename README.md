# CoffeeLab

### Proyecto realizado por Jose Antonio Marín Rodríguez de 2ºDAW

API REST desarrollada en **Laravel** para una tienda online de café en grano, cafeteras y accesorios. Gestiona productos con variantes, pedidos con seguimiento de estado y usuarios con roles.

---

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop) y Docker Compose

---

## Estructura del proyecto

```
CoffeeLab/
└── backend/
    ├── docker/
    │   └── php/
    │       └── Dockerfile
    ├── src/                  # Proyecto Laravel
    ├── docker-compose.yml
    └── README.md
```

---

## Instalación desde cero

### 1. Configurar el `.env`

Copia el archivo de ejemplo y configúralo:

```bash
src/.env.example src/.env
```

Asegúrate de que el `.env` tenga estos valores para conectar con la base de datos del contenedor:

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

### 3. Entrar al contenedor

```bash
docker exec -it CoffeLab-app bash
```

### 4. Instalar dependencias

```bash
composer install
```

### 5. Generar la app key

```bash
php artisan key:generate
```

### 6. Ejecutar las migraciones

```bash
php artisan migrate
```

La aplicación estará disponible en **http://localhost:8000**

---

## Base de datos

### Tablas

| Tabla | Descripción |
|---|---|
| `usuarios` | Clientes y administradores de la tienda |
| `categorias` | Agrupación de productos (café, cafeteras, accesorios) |
| `productos` | Catálogo de productos con precio y stock |
| `variantes_producto` | Variantes por producto (tamaño, color, etc.) con modificador de precio |
| `pedidos` | Pedidos realizados por los usuarios con seguimiento de estado |
| `items_pedido` | Líneas de cada pedido con precio unitario en el momento de la compra |

### Relaciones

```
usuarios      ──< pedidos
pedidos       ──< items_pedido
productos     ──< items_pedido
variantes     ──< items_pedido
categorias    ──< productos
productos     ──< variantes_producto
```

### Estados de un pedido

`pendiente` → `pagado` → `enviado` → `entregado` / `cancelado`

### Roles de usuario

- `cliente` — rol por defecto
- `admin` — acceso a gestión del catálogo y pedidos

---

## Comandos útiles

```bash
# Levantar contenedores
docker compose up -d

# Parar contenedores
docker compose down

# Entrar al contenedor de la app
docker exec -it CoffeLab-app bash

# Ver logs de la app
docker compose logs -f app

# Resetear y volver a migrar
php artisan db:wipe && php artisan migrate

# Limpiar caché de configuración
php artisan config:clear
php artisan cache:clear
```

---

## Modelos

| Modelo | Tabla |
|---|---|
| `User` | `usuarios` |
| `Categoria` | `categorias` |
| `Producto` | `productos` |
| `VarianteProducto` | `variantes_producto` |
| `Pedido` | `pedidos` |
| `ItemPedido` | `items_pedido` |