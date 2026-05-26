import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PedidoService, Pedido } from '../../services/pedido';

/**
 * @function direccionValidator
 * @description Validador personalizado para asegurar que una dirección tenga un formato específico.
 * Se espera que la dirección esté separada por comas en al menos 4 partes (ej. "Calle, Ciudad, Código Postal, País").
 * * @param {AbstractControl} control El control del formulario que contiene el valor a validar.
 * @returns {ValidationErrors | null} Retorna un error `{ formatoInvalido: true }` si no cumple el formato, o `null` si es válido.
 */
function direccionValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value?.trim();
  
  // Si no hay valor, la validación falla
  if (!valor) return { formatoInvalido: true };
  
  // Divide la cadena por comas y elimina los espacios en blanco de cada parte
  const partes = valor.split(',').map((p: string) => p.trim());
  
  // Verifica que existan al menos 4 partes y que ninguna esté vacía
  return partes.length >= 4 && partes.every((p: string) => p.length > 0)
    ? null
    : { formatoInvalido: true };
}

/**
 * @class MiCuenta
 * @description Componente que muestra el panel de control del usuario. 
 * Permite visualizar el historial de pedidos, cerrar sesión y actualizar la dirección de envío.
 */
@Component({
  selector: 'app-mi-cuenta',
  imports: [RouterLink, DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta implements OnInit {
  /** @private Servicio para gestionar el estado de sesión y datos del usuario. */
  private authService = inject(AuthService);
  
  /** @private Servicio para obtener el historial de pedidos del usuario. */
  private pedidoService = inject(PedidoService);
  
  /** @private Constructor de formularios reactivos. */
  private fb = inject(FormBuilder);

  /** * @description Referencia reactiva a los datos del usuario actual proveniente del AuthService. 
   */
  usuario = this.authService.usuario;

  /**
   * @type {Signal<Pedido[]>}
   * @description Señal que almacena la lista de pedidos realizados por el usuario.
   */
  pedidos = signal<Pedido[]>([]);

  /**
   * @type {Signal<boolean>}
   * @description Señal que controla la visibilidad del formulario de edición de dirección.
   */
  editandoDireccion = signal<boolean>(false);

  /**
   * @type {Signal<boolean>}
   * @description Señal que indica si hay una petición en curso para guardar la nueva dirección.
   */
  guardando = signal<boolean>(false);

  /**
   * @description Formulario reactivo para actualizar la dirección. Incluye el validador personalizado.
   */
  form = this.fb.group({
    direccion: ['', [Validators.required, direccionValidator]],
  });

  /**
   * @description Getter para acceder fácilmente al control del formulario de dirección desde la vista.
   * @returns {AbstractControl | null}
   */
  get direccion() { return this.form.get('direccion'); }

  /**
   * @method ngOnInit
   * @description Hook del ciclo de vida que se ejecuta al inicializar el componente.
   * Carga el historial completo de pedidos del usuario y actualiza la señal `pedidos`.
   */
  ngOnInit() {
    this.pedidoService.getAllSinPaginar().subscribe(p => this.pedidos.set(p));
  }

  /**
   * @method cerrarSesion
   * @description Llama al servicio de autenticación para cerrar la sesión del usuario actual.
   */
  cerrarSesion() {
    this.authService.logout();
  }

  /**
   * @method abrirEditarDireccion
   * @description Prepara y muestra el formulario de edición de dirección. 
   * Pre-rellena el campo con la dirección actual del usuario.
   */
  abrirEditarDireccion() {
    this.form.patchValue({ direccion: this.usuario()?.direccion ?? '' });
    this.editandoDireccion.set(true);
  }

  /**
   * @method cerrarEditarDireccion
   * @description Oculta el formulario de edición de dirección y restablece su estado.
   */
  cerrarEditarDireccion() {
    this.editandoDireccion.set(false);
    this.form.reset();
  }

  /**
   * @method guardarDireccion
   * @description Valida y envía la nueva dirección al servidor a través del AuthService.
   * Maneja el estado de carga y cierra el modo edición tras un éxito.
   */
  guardarDireccion() {
    // 1. Verificación de validez del formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 2. Inicia el estado de guardado
    this.guardando.set(true);

    // 3. Petición al servidor para actualizar el perfil
    this.authService.actualizar({ direccion: this.form.value.direccion! }).subscribe({
      next: () => {
        this.cerrarEditarDireccion();
        this.guardando.set(false);
      },
      error: () => {
        // En un entorno real, aquí se podría añadir un manejo de errores (ej. mostrar una alerta)
        this.guardando.set(false);
      },
    });
  }

  /**
   * @method estadoClase
   * @description Asigna una clase CSS específica según el estado actual de un pedido.
   * * @param {string} estado El estado del pedido (ej. 'pendiente', 'pagado').
   * @returns {string} El nombre de la clase CSS correspondiente, o una cadena vacía si no hay coincidencia.
   */
  estadoClase(estado: string): string {
    const clases: Record<string, string> = {
      pendiente: 'estado-pendiente',
      pagado: 'estado-pagado',
      enviado: 'estado-enviado',
      entregado: 'estado-entregado',
      cancelado: 'estado-cancelado',
    };
    return clases[estado] ?? '';
  }
}