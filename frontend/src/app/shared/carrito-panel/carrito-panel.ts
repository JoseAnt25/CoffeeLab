import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';

@Component({
  selector: 'app-carrito-panel',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './carrito-panel.html',
  styleUrl: './carrito-panel.css',
})
export class CarritoPanel {
  carritoService = inject(CarritoService);

  abierto = input<boolean>(false);
  cerrar = output<void>();

  eliminar(productoId: number, varianteId: number | null) {
    this.carritoService.eliminar(productoId, varianteId);
  }

  onCerrar() {
    this.cerrar.emit();
  }
}