import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PedidoService, Pedido } from '../../services/pedido';

@Component({
  selector: 'app-mi-cuenta',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta implements OnInit {
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);

  usuario = this.authService.usuario;
  pedidos = signal<Pedido[]>([]);

  ngOnInit() {
    this.pedidoService.getAll().subscribe(p => this.pedidos.set(p));
  }

  cerrarSesion() {
    this.authService.logout();
  }

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