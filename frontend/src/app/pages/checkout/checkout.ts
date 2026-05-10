import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { PedidoService } from '../../services/pedido';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  usuario = this.authService.usuario;
  carritoItems = this.carritoService.items;
  total = this.carritoService.total;

  nuevaDireccion = signal<string>('');
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  pedidoCreado = signal<boolean>(false);

  ngOnInit() {
    if (this.carritoItems().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  tieneDireccion(): boolean {
    return !!this.usuario()?.direccion;
  }

  confirmarPedido() {
    const usuario = this.usuario();
    if (!usuario) return;

    const direccion = this.tieneDireccion()
      ? usuario.direccion!
      : this.nuevaDireccion();

    if (!direccion) {
      this.error.set('Por favor introduce una dirección de envío.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const pedido = {
      usuario_id: usuario.id,
      direccion_envio: direccion,
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