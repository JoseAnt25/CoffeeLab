import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { PedidoService } from '../../services/pedido';

/**
 * Validador personalizado para el formato de dirección de envío.
 *
 * Verifica que la dirección tenga al menos 4 partes separadas por comas
 * y que ninguna parte esté vacía.
 *
 * Formato esperado: Calle Número, Piso/Edificio, Ciudad, Provincia, País
 * Ejemplo válido: "C. Alhambra 25, 3ºB, Aguadulce, Almería, España"
 *
 * @param control Control del formulario a validar
 * @returns null si es válido, { formatoInvalido: true } si no lo es
 */
function direccionValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value?.trim();
  if (!valor) return { formatoInvalido: true };

  const partes = valor.split(',').map((p: string) => p.trim());
  return partes.length >= 4 && partes.every((p: string) => p.length > 0)
    ? null
    : { formatoInvalido: true };
}

/**
 * Componente de la página de checkout (finalización de pedido).
 *
 * Gestiona el proceso de confirmación del pedido en dos casos:
 * 1. Usuario con dirección guardada: muestra la dirección y permite confirmar directamente
 * 2. Usuario sin dirección: muestra un formulario para introducir la dirección
 *    que se guardará en su perfil para futuros pedidos
 *
 * Si el carrito está vacío al cargar el componente, redirige automáticamente
 * al carrito para evitar pedidos vacíos.
 *
 * Tras confirmar el pedido exitosamente, vacía el carrito y muestra
 * una pantalla de confirmación con enlace al historial de pedidos.
 */
@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  /** Signal con los datos del usuario autenticado */
  usuario = this.authService.usuario;

  /** Signal con los items actuales del carrito */
  carritoItems = this.carritoService.items;

  /** Computed signal con el total del carrito */
  total = this.carritoService.total;

  /** Signal que indica si se está procesando el pedido */
  cargando = signal<boolean>(false);

  /** Signal con el mensaje de error si la creación del pedido falla */
  error = signal<string | null>(null);

  /** Signal que indica si el pedido se ha creado correctamente */
  pedidoCreado = signal<boolean>(false);

  /**
   * Formulario reactivo para la dirección de envío.
   * Solo se muestra si el usuario no tiene dirección guardada.
   * Usa el validador personalizado direccionValidator.
   */
  form = this.fb.group({
    direccion: ['', [Validators.required, direccionValidator]],
  });

  /** Getter para acceder al control de dirección del formulario */
  get direccion() { return this.form.get('direccion'); }

  /**
   * Verifica que el carrito no esté vacío al inicializar.
   * Redirige al carrito si no hay items para evitar pedidos vacíos.
   */
  ngOnInit() {
    if (this.carritoItems().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  /**
   * Comprueba si el usuario tiene una dirección de envío guardada.
   *
   * @returns true si el usuario tiene dirección, false en caso contrario
   */
  tieneDireccion(): boolean {
    return !!this.usuario()?.direccion;
  }

  /**
   * Confirma y crea el pedido.
   *
   * Si el usuario no tiene dirección guardada, valida el formulario
   * antes de proceder. Si la validación falla, marca todos los campos
   * como tocados para mostrar los errores.
   *
   * Tras crear el pedido exitosamente, vacía el carrito y muestra
   * la pantalla de confirmación.
   */
  confirmarPedido() {
    const usuario = this.usuario();
    if (!usuario) return;

    let direccionEnvio = usuario.direccion;

    // Validar formulario si el usuario no tiene dirección guardada
    if (!this.tieneDireccion()) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      direccionEnvio = this.form.value.direccion!;
    }

    this.cargando.set(true);
    this.error.set(null);

    const pedido = {
      usuario_id: usuario.id,
      direccion_envio: direccionEnvio!,
      items: this.carritoItems().map(item => ({
        producto_id: item.producto.id,
        variante_id: item.variante?.id ?? null,
        cantidad: item.cantidad,
      })),
    };

    this.pedidoService.crear(pedido).subscribe({
      next: () => {
        this.carritoService.vaciar();
        this.pedidoCreado.set(true);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje ?? 'Error al crear el pedido.');
        this.cargando.set(false);
      },
    });
  }
}