import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  carritoService = inject(CarritoService);
  authService = inject(AuthService);

  actualizarCantidad(productoId: number, varianteId: number | null, event: Event) {
    const cantidad = Number((event.target as HTMLInputElement).value);
    this.carritoService.actualizarCantidad(productoId, varianteId, cantidad);
  }

  eliminar(productoId: number, varianteId: number | null) {
    this.carritoService.eliminar(productoId, varianteId);
  }
}