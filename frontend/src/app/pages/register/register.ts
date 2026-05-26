import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';

/**
 * @function contrasenasCoincidenValidator
 * @description Validador personalizado a nivel de grupo de formulario para asegurar que la contraseña y su confirmación sean idénticas.
 * @param {AbstractControl} control El grupo de formulario (FormGroup) que contiene los campos a comparar.
 * @returns {ValidationErrors | null} Retorna un error `{ noCoinciden: true }` si no son iguales, o `null` si coinciden.
 */
function contrasenasCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.get('contrasena')?.value;
  const confirmacion = control.get('contrasenaConfirmacion')?.value;
  return contrasena === confirmacion ? null : { noCoinciden: true };
}

/**
 * @class Register
 * @description Componente responsable de la interfaz y la lógica de registro de nuevos usuarios.
 * Utiliza formularios reactivos con validaciones cruzadas y Signals para manejar el estado visual.
 */
@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  /** @private Servicio para gestionar la autenticación y el registro de usuarios. */
  private authService = inject(AuthService);
  
  /** @private Servicio de enrutamiento para redirigir tras un registro exitoso. */
  private router = inject(Router);
  
  /** @private Constructor de formularios para definir la estructura y validaciones. */
  private fb = inject(FormBuilder);

  /**
   * @type {Signal<string | null>}
   * @description Señal que almacena mensajes de error devueltos por el servidor para mostrarlos en la interfaz.
   */
  error = signal<string | null>(null);

  /**
   * @type {Signal<boolean>}
   * @description Señal que indica si la petición de registro está en curso, útil para bloquear el botón de envío.
   */
  cargando = signal<boolean>(false);

  /**
   * @description Grupo de formulario reactivo que contiene los datos del usuario.
   * Aplica validadores individuales (requerido, email, longitud) y el validador global de grupo para las contraseñas.
   */
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    contrasenaConfirmacion: ['', [Validators.required]],
  }, { validators: contrasenasCoincidenValidator });

  /** @description Getter para el control del nombre. */
  get nombre() { return this.form.get('nombre'); }
  
  /** @description Getter para el control del correo electrónico. */
  get correo() { return this.form.get('correo'); }
  
  /** @description Getter para el control de la contraseña. */
  get contrasena() { return this.form.get('contrasena'); }
  
  /** @description Getter para el control de la confirmación de la contraseña. */
  get contrasenaConfirmacion() { return this.form.get('contrasenaConfirmacion'); }

  /**
   * @method registrarse
   * @description Valida el formulario y envía los datos de registro al servidor. 
   * Maneja el estado de carga y las redirecciones o errores resultantes.
   * @returns {void}
   */
  registrarse(): void {
    // 1. Verificación local: si el formulario es inválido, muestra los errores al usuario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 2. Preparar el estado visual para la petición HTTP
    this.cargando.set(true);
    this.error.set(null);

    // 3. Enviar la petición al servicio de autenticación
    this.authService.register({
      nombre: this.form.value.nombre!,
      correo: this.form.value.correo!,
      contrasena: this.form.value.contrasena!,
      // Mapea la confirmación al formato que probablemente espera el backend (snake_case)
      contrasena_confirmation: this.form.value.contrasenaConfirmacion!,
    }).subscribe({
      next: () => {
        // Registro exitoso: redirigir a la página principal (o dashboard)
        this.router.navigate(['/']);
      },
      error: (err) => {
        // Error en el registro: extrae el mensaje de error del backend o usa un mensaje por defecto
        this.error.set(err.error?.message ?? 'Error al registrarse.');
        this.cargando.set(false);
      },
    });
  }
}