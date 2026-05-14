import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.estaAutenticado() && auth.esAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};