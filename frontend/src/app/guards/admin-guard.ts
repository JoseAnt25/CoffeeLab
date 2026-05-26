import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Guard de administrador.
 *
 * Protege las rutas exclusivas del panel de administración.
 * Verifica que el usuario esté autenticado Y tenga rol 'admin'.
 * Si no cumple alguna de las dos condiciones, redirige a la página de inicio.
 *
 * A diferencia del authGuard, no redirige al login sino al inicio,
 * ya que un cliente autenticado no debería acceder al panel admin.
 *
 * Rutas protegidas: /admin, /admin/productos, /admin/pedidos
 *
 * @example
 * // En app.routes.ts
 * { path: 'admin', component: AdminLayout, canActivate: [adminGuard] }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.estaAutenticado() && auth.esAdmin()) {
    return true;
  }

  // Redirigir al inicio si no es admin (no al login, para evitar confusión)
  router.navigate(['/']);
  return false;
};