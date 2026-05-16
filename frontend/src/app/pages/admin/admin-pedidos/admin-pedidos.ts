import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../../../services/pedido';

@Component({
  selector: 'app-admin-pedidos',
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css',
})
export class AdminPedidos implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos = signal<Pedido[]>([]);
  pedidoDetalle = signal<Pedido | null>(null);
  pagina = signal<number>(1);
  ultimaPagina = signal<number>(1);
  total = signal<number>(0);
  estados = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidoService.getAll(this.pagina()).subscribe(res => {
      this.pedidos.set(res.data);
      this.ultimaPagina.set(res.last_page);
      this.total.set(res.total);
    });
  }

  irPagina(pagina: number) {
    this.pagina.set(pagina);
    this.cargarPedidos();
  }

  verDetalle(pedido: Pedido) {
    this.pedidoDetalle.set(pedido);
  }

  cerrarDetalle() {
    this.pedidoDetalle.set(null);
  }

  cambiarEstado(pedido: Pedido, event: Event) {
    const estado = (event.target as HTMLSelectElement).value;
    this.pedidoService.actualizarEstado(pedido.id, estado).subscribe({
      next: (p) => {
        this.pedidos.update(pedidos =>
          pedidos.map(item => item.id === p.id ? p : item)
        );
      },
      error: (err) => {
        alert(err.error?.mensaje ?? 'No se puede realizar ese cambio de estado.');
        this.cargarPedidos();
      }
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