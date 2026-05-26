import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

/**
 * Configuración principal de la aplicación Angular.
 *
 * Define los providers globales que estarán disponibles
 * en toda la aplicación sin necesidad de importarlos en cada componente.
 *
 * Providers configurados:
 * - provideBrowserGlobalErrorListeners: captura errores globales del navegador
 * - provideRouter: configura el sistema de rutas con lazy loading
 * - provideHttpClient: habilita el cliente HTTP con el interceptor de autenticación
 *   que añade automáticamente el token Bearer en cada petición
 * - provideAnimationsAsync: habilita las animaciones de Angular Material
 *   de forma asíncrona para no bloquear la carga inicial
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Cliente HTTP con interceptor de autenticación para añadir token Bearer
    provideHttpClient(withInterceptors([authInterceptor])),
    // Animaciones asíncronas para Angular Material
    provideAnimationsAsync(),
  ]
};