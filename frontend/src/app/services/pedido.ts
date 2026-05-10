import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ItemPedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  variante_id: number | null;
  cantidad: number;
  precio_unitario: number;
  producto?: { id: number; nombre: string; precio: number };
  variante?: { id: number; nombre: string; modificador_precio: number };
}

export interface Pedido {
  id: number;
  usuario_id: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
  direccion_envio: string;
  created_at: string;
  items?: ItemPedido[];
}

export interface CrearPedidoDto {
  usuario_id: number;
  direccion_envio: string;
  items: {
    producto_id: number;
    variante_id: number | null;
    cantidad: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`);
  }

  getById(id: number) {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  crear(pedido: CrearPedidoDto) {
    return this.http.post<Pedido>(`${this.apiUrl}/pedidos`, pedido);
  }

  actualizarEstado(id: number, estado: string) {
    return this.http.put<Pedido>(`${this.apiUrl}/pedidos/${id}`, { estado });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/pedidos/${id}`);
  }
}