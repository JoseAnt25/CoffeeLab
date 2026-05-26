import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

/**
 * Interfaz que representa un usuario de la aplicación.
 */
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  direccion: string | null;
  rol: string;
}

/**
 * Servicio de autenticación.
 *
 * Gestiona el estado de autenticación del usuario mediante signals de Angular.
 * El token y los datos del usuario se persisten en localStorage para mantener
 * la sesión entre recargas de página.
 *
 * El interceptor AuthInterceptor usa el token almacenado para añadir
 * automáticamente la cabecera Authorization en cada petición HTTP.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** URL base de la API del backend */
  private apiUrl = 'http://localhost:8000/api';

  /**
   * Signal con los datos del usuario autenticado.
   * null si no hay sesión activa.
   * Se inicializa desde localStorage al arrancar la aplicación.
   */
  usuario = signal<Usuario | null>(null);

  /**
   * Inicializa el servicio recuperando el usuario desde localStorage
   * para restaurar la sesión tras una recarga de página.
   */
  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      this.usuario.set(JSON.parse(stored));
    }
  }

  /**
   * Autentica al usuario con sus credenciales.
   *
   * Almacena el token y los datos del usuario en localStorage
   * y actualiza el signal usuario.
   *
   * @param correo    Correo electrónico del usuario
   * @param contrasena Contraseña del usuario
   * @returns Observable con el usuario y token de acceso
   */
  login(correo: string, contrasena: string) {
    return this.http.post<{ usuario: Usuario; token: string }>(
      `${this.apiUrl}/login`,
      { correo, contrasena }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.usuario.set(res.usuario);
      })
    );
  }

  /**
   * Registra un nuevo usuario en la aplicación.
   *
   * Tras el registro exitoso, almacena el token y los datos
   * del usuario como si hubiera iniciado sesión.
   *
   * @param datos Datos del formulario de registro
   * @returns Observable con el usuario creado y token de acceso
   */
  register(datos: { nombre: string; correo: string; contrasena: string; contrasena_confirmation: string }) {
    return this.http.post<{ usuario: Usuario; token: string }>(
      `${this.apiUrl}/register`,
      datos
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.usuario.set(res.usuario);
      })
    );
  }

  /**
   * Cierra la sesión del usuario.
   *
   * Invalida el token en el servidor, elimina los datos de localStorage
   * y redirige al usuario a la página de login.
   */
  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba si hay un usuario autenticado.
   *
   * @returns true si hay un token en localStorage, false en caso contrario
   */
  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Comprueba si el usuario autenticado tiene rol de administrador.
   *
   * @returns true si el rol del usuario es 'admin', false en caso contrario
   */
  esAdmin(): boolean {
    return this.usuario()?.rol === 'admin';
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado.
   *
   * Sincroniza los nuevos datos con localStorage y el signal usuario
   * para reflejar los cambios inmediatamente en la interfaz.
   *
   * @param datos Campos a actualizar: nombre y/o direccion
   * @returns Observable con el usuario actualizado
   */
  actualizar(datos: { nombre?: string; direccion?: string }) {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, datos).pipe(
      tap(usuario => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuario.set(usuario);
      })
    );
  }
}