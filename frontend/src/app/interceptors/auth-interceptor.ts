import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de autenticación HTTP.
 *
 * Intercepta todas las peticiones HTTP salientes y añade automáticamente
 * la cabecera Authorization con el token Bearer de Sanctum si existe
 * en localStorage.
 *
 * Esto permite que todas las peticiones a rutas protegidas de la API
 * incluyan el token sin necesidad de añadirlo manualmente en cada servicio.
 *
 * Si no hay token (usuario no autenticado), la petición se envía
 * sin cabecera de autorización, lo que es correcto para las rutas públicas.
 *
 * Se registra en app.config.ts usando provideHttpClient(withInterceptors([authInterceptor]))
 *
 * @example
 * // Cabecera añadida automáticamente:
 * Authorization: Bearer 1|abc123xyz...
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    // Clonar la petición añadiendo la cabecera de autorización
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  // Sin token: enviar la petición original sin modificar
  return next(req);
};