import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

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
    path: '**',
    redirectTo: '',
  },
];