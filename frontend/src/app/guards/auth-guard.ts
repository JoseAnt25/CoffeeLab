import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Guard de autenticación.
 *
 * Protege las rutas que requieren que el usuario esté autenticado.
 * Si el usuario no tiene token en localStorage, redirige al login
 * pasando la URL original como parámetro returnUrl para poder
 * redirigir de vuelta tras el inicio de sesión.
 *
 * Rutas protegidas: /checkout, /mi-cuenta
 *
 * @example
 * // En app.routes.ts
 * { path: 'checkout', component: Checkout, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Redirigir al login guardando la URL de destino para recuperarla tras el login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};