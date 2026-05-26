import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

/**
 * @class Login
 * @description Componente responsable de gestionar la interfaz y la lógica de inicio de sesión.
 * Implementa formularios reactivos para la captura de datos y Angular Signals para la gestión del estado.
 */
@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** @private Servicio para gestionar la autenticación de usuarios. */
  private authService = inject(AuthService);
  /** @private Servicio de enrutamiento para la navegación programática. */
  private router = inject(Router);
  /** @private Servicio para obtener información sobre la ruta actualmente activa (ej. query params). */
  private route = inject(ActivatedRoute);
  /** @private Constructor de formularios para crear grupos y controles reactivos. */
  private fb = inject(FormBuilder);

  /**
   * @type {Signal<string | null>}
   * @description Señal reactiva que almacena los mensajes de error para mostrarlos en la UI.
   */
  error = signal<string | null>(null);

  /**
   * @type {Signal<boolean>}
   * @description Señal reactiva que indica si hay una petición de inicio de sesión en curso (para mostrar spinners o deshabilitar botones).
   */
  cargando = signal<boolean>(false);

  /**
   * @description Grupo de formulario reactivo que contiene las credenciales del usuario.
   * Incluye validaciones síncronas de obligatoriedad, formato de email y longitud mínima.
   */
  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
  });

  /**
   * Obtiene el control del formulario correspondiente al correo electrónico.
   * @returns {AbstractControl | null}
   */
  get correo() { return this.form.get('correo'); }

  /**
   * Obtiene el control del formulario correspondiente a la contraseña.
   * @returns {AbstractControl | null}
   */
  get contrasena() { return this.form.get('contrasena'); }

  /**
   * @method iniciarSesion
   * @description Procesa el envío del formulario. Si los datos son válidos, llama al servicio de autenticación.
   * @returns {void}
   */
  iniciarSesion(): void {
    // 1. Verificación de validez del formulario
    if (this.form.invalid) {
      // Marca todos los campos como "tocados" para disparar los mensajes de error en la vista
      this.form.markAllAsTouched();
      return;
    }

    // 2. Actualización del estado visual (inicio de petición)
    this.cargando.set(true);
    this.error.set(null);

    // 3. Llamada al servicio de autenticación
    this.authService.login(
      this.form.value.correo!,
      this.form.value.contrasena!
    ).subscribe({
      next: () => {
        // En caso de éxito, busca la URL de redirección (si venía de un guard) o redirige al inicio '/'
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        // En caso de error, muestra un mensaje genérico y detiene el estado de carga
        this.error.set('Correo o contraseña incorrectos.');
        this.cargando.set(false);
      },
    });
  }
}