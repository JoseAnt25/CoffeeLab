import { Injectable, signal, computed } from '@angular/core';
import { Producto, Variante } from './producto';

export interface ItemCarrito {
  producto: Producto;
  variante: Variante | null;
  cantidad: number;
  precioUnitario: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  items = signal<ItemCarrito[]>([]);

  total = computed(() =>
    this.items().reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0)
  );

  totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  agregar(producto: Producto, variante: Variante | null, cantidad: number = 1) {
    const precioUnitario = Number(producto.precio) + (variante ? Number(variante.modificador_precio) : 0);

    this.items.update(items => {
      const existente = items.find(
        i => i.producto.id === producto.id && i.variante?.id === variante?.id
      );

      if (existente) {
        return items.map(i =>
          i.producto.id === producto.id && i.variante?.id === variante?.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }

      return [...items, { producto, variante, cantidad, precioUnitario }];
    });
  }

  eliminar(productoId: number, varianteId: number | null) {
    this.items.update(items =>
      items.filter(i => !(i.producto.id === productoId && i.variante?.id === varianteId))
    );
  }

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

  vaciar() {
    this.items.set([]);
  }
}