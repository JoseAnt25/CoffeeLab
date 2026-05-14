import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PedidoService, Pedido } from '../../services/pedido';

@Component({
  selector: 'app-mi-cuenta',
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta implements OnInit {
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);

  usuario = this.authService.usuario;
  pedidos = signal<Pedido[]>([]);

  editandoDireccion = signal<boolean>(false);
  nuevaDireccion = signal<string>('');
  guardando = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.pedidoService.getAll().subscribe(p => this.pedidos.set(p));
  }

  cerrarSesion() {
    this.authService.logout();
  }

  abrirEditarDireccion() {
    this.nuevaDireccion.set(this.usuario()?.direccion ?? '');
    this.editandoDireccion.set(true);
  }

  cerrarEditarDireccion() {
    this.editandoDireccion.set(false);
    this.error.set(null);
  }

  guardarDireccion() {
    if (!this.nuevaDireccion()) {
      this.error.set('La dirección no puede estar vacía.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.authService.actualizar({ direccion: this.nuevaDireccion() }).subscribe({
      next: () => {
        this.cerrarEditarDireccion();
        this.guardando.set(false);
      },
      error: () => {
        this.error.set('Error al guardar la dirección.');
        this.guardando.set(false);
      },
    });
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