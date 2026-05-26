import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';

/**
 * Componente de panel lateral del carrito de compras.
 *
 * Se muestra como un drawer desde la derecha de la pantalla
 * al hacer clic en el icono del carrito en la navbar.
 * Incluye un overlay semitransparente que cierra el panel al hacer clic.
 *
 * El panel recibe su estado (abierto/cerrado) desde el componente padre
 * mediante un input signal, y comunica el evento de cierre mediante un output.
 * Esto sigue el patrón de comunicación padre-hijo de Angular.
 *
 * Muestra el listado de items con nombre, variante, cantidad y precio,
 * permite eliminar items individualmente y proporciona accesos directos
 * a la página del carrito completo y al checkout.
 */
@Component({
  selector: 'app-carrito-panel',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './carrito-panel.html',
  styleUrl: './carrito-panel.css',
})
export class CarritoPanel {
  /** Servicio del carrito para acceder a los items y el total */
  carritoService = inject(CarritoService);

  /**
   * Input signal que controla si el panel está abierto o cerrado.
   * Se gestiona desde el componente padre (Navbar).
   */
  abierto = input<boolean>(false);

  /**
   * Output que emite cuando el usuario solicita cerrar el panel.
   * El padre (Navbar) escucha este evento para actualizar su signal panelAbierto.
   */
  cerrar = output<void>();

  /**
   * Elimina un item del carrito por producto y variante.
   *
   * @param productoId ID del producto a eliminar
   * @param varianteId ID de la variante o null si no tiene variante
   */
  eliminar(productoId: number, varianteId: number | null) {
    this.carritoService.eliminar(productoId, varianteId);
  }

  /**
   * Emite el evento de cierre al componente padre.
   * Se llama al hacer clic en el overlay o en el botón de cerrar.
   */
  onCerrar() {
    this.cerrar.emit();
  }
}