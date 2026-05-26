import { Injectable, signal, computed } from '@angular/core';
import { Producto, Variante } from './producto';

/**
 * Interfaz que representa un item en el carrito de compras.
 * El precio unitario incluye ya el modificador de la variante seleccionada.
 */
export interface ItemCarrito {
  producto: Producto;
  variante: Variante | null;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Servicio del carrito de compras.
 *
 * Gestiona el estado del carrito mediante signals de Angular.
 * El carrito se mantiene en memoria durante la sesión y se pierde
 * al recargar la página (no se persiste en localStorage).
 *
 * Los computed signals total y totalItems se recalculan automáticamente
 * cuando cambia el array de items.
 */
@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  /**
   * Signal con los items actuales del carrito.
   * Cada item incluye el producto, la variante seleccionada,
   * la cantidad y el precio unitario calculado.
   */
  items = signal<ItemCarrito[]>([]);

  /**
   * Computed signal con el precio total del carrito.
   * Se recalcula automáticamente cuando cambian los items.
   */
  total = computed(() =>
    this.items().reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0)
  );

  /**
   * Computed signal con el número total de unidades en el carrito.
   * Se usa para mostrar el badge en el icono del carrito en el navbar.
   */
  totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe.
   *
   * Si el producto con la misma variante ya está en el carrito,
   * suma la cantidad en lugar de crear un nuevo item.
   * El precio unitario se calcula sumando el precio base del producto
   * más el modificador de precio de la variante seleccionada.
   *
   * @param producto  Producto a añadir
   * @param variante  Variante seleccionada o null si no tiene variantes
   * @param cantidad  Número de unidades a añadir (por defecto 1)
   */
  agregar(producto: Producto, variante: Variante | null, cantidad: number = 1) {
    const precioUnitario = Number(producto.precio) + (variante ? Number(variante.modificador_precio) : 0);

    this.items.update(items => {
      const existente = items.find(
        i => i.producto.id === producto.id && i.variante?.id === variante?.id
      );

      if (existente) {
        // Incrementar cantidad si el item ya existe
        return items.map(i =>
          i.producto.id === producto.id && i.variante?.id === variante?.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }

      // Añadir nuevo item al carrito
      return [...items, { producto, variante, cantidad, precioUnitario }];
    });
  }

  /**
   * Elimina un item del carrito por producto y variante.
   *
   * @param productoId ID del producto a eliminar
   * @param varianteId ID de la variante o null si no tiene variante
   */
  eliminar(productoId: number, varianteId: number | null) {
    this.items.update(items =>
      items.filter(i => !(i.producto.id === productoId && i.variante?.id === varianteId))
    );
  }

  /**
   * Actualiza la cantidad de un item del carrito.
   * Si la cantidad es 0 o negativa, elimina el item del carrito.
   *
   * @param productoId ID del producto
   * @param varianteId ID de la variante o null si no tiene variante
   * @param cantidad   Nueva cantidad
   */
  actualizarCantidad(productoId: number, varianteId: number | null, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminar(productoId, varianteId);
      return;
    }

    this.items.update(items =>
      items.map(i =>
        i.producto.id === productoId && i.variante?.id === varianteId
          ? { ...i, cantidad }
          : i
      )
    );
  }

  /**
   * Vacía completamente el carrito.
   * Se llama tras confirmar un pedido exitosamente.
   */
  vaciar() {
    this.items.set([]);
  }
}