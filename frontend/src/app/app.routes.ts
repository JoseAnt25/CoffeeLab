import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

/**
 * Configuración de rutas de la aplicación CoffeLab.
 *
 * Todas las rutas usan lazy loading (loadComponent) para cargar
 * los componentes solo cuando se navega a ellos, mejorando el
 * rendimiento inicial de la aplicación.
 *
 * Rutas públicas (sin autenticación):
 * - /           → Página de inicio con hero, historia y productos destacados
 * - /catalogo   → Catálogo completo con filtros por categoría
 * - /catalogo/:id → Detalle de producto con variantes y carrito
 * - /carrito    → Página del carrito de compras
 * - /login      → Formulario de inicio de sesión
 * - /register   → Formulario de registro de usuario
 *
 * Rutas protegidas (requieren autenticación - authGuard):
 * - /checkout   → Proceso de finalización de pedido
 * - /mi-cuenta  → Perfil y historial de pedidos del usuario
 *
 * Rutas de administración (requieren rol admin - adminGuard):
 * - /admin              → Redirige a /admin/productos
 * - /admin/productos    → Gestión del catálogo de productos
 * - /admin/pedidos      → Gestión y seguimiento de pedidos
 *
 * Cualquier ruta no reconocida redirige a la página de inicio.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () => import('./pages/detalle-producto/detalle-producto').then(m => m.DetalleProducto),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'mi-cuenta',
    loadComponent: () => import('./pages/mi-cuenta/mi-cuenta').then(m => m.MiCuenta),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        // Redirige /admin a /admin/productos por defecto
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full',
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/admin/admin-productos/admin-productos').then(m => m.AdminProductos),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/admin/admin-pedidos/admin-pedidos').then(m => m.AdminPedidos),
      },
    ],
  },
  {
    // Ruta comodín: redirige cualquier ruta no reconocida al inicio
    path: '**',
    redirectTo: '',
  },
];