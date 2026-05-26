import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';

/**
 * Componente de la página del carrito de compras.
 *
 * Muestra el listado completo de productos añadidos al carrito
 * con sus variantes, cantidades y precios. Incluye un resumen
 * lateral con el subtotal, envío y total del pedido.
 *
 * Funcionalidades:
 * - Listado de items con nombre, variante y precio unitario
 * - Actualización de cantidad mediante input numérico
 * - Eliminación individual de items
 * - Resumen del pedido con total calculado
 * - Botón para vaciar el carrito completo
 * - Enlace al checkout (si autenticado) o al login (si no autenticado)
 *
 * Si el carrito está vacío, muestra un mensaje con enlace al catálogo.
 */
@Component({
  selector: 'app-carrito',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  /** Servicio del carrito para acceder a items, total y operaciones */
  carritoService = inject(CarritoService);

  /** Servicio de autenticación para mostrar el botón correcto en el resumen */
  authService = inject(AuthService);

  /**
   * Actualiza la cantidad de un item del carrito desde el input numérico.
   * Si la cantidad es 0 o negativa, el servicio elimina el item automáticamente.
   *
   * @param productoId ID del producto a actualizar
   * @param varianteId ID de la variante o null si no tiene variante
   * @param event      Evento change del input numérico con la nueva cantidad
   */
  actualizarCantidad(productoId: number, varianteId: number | null, event: Event) {
    const cantidad = Number((event.target as HTMLInputElement).value);
    this.carritoService.actualizarCantidad(productoId, varianteId, cantidad);
  }

  /**
   * Elimina un item del carrito.
   *
   * @param productoId ID del producto a eliminar
   * @param varianteId ID de la variante o null si no tiene variante
   */
  eliminar(productoId: number, varianteId: number | null) {
    this.carritoService.eliminar(productoId, varianteId);
  }
}