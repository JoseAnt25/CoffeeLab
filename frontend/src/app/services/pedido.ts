import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/**
 * Interfaz que representa una línea de pedido (item).
 * Almacena el precio unitario en el momento de la compra
 * para preservar el historial aunque los precios cambien.
 */
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

/**
 * Interfaz genérica para respuestas paginadas de la API.
 * Laravel devuelve este formato cuando se usa el método paginate().
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

/**
 * Interfaz que representa un pedido completo.
 * El campo usuario solo se incluye cuando lo solicita un administrador.
 */
export interface Pedido {
  id: number;
  usuario_id: number;
  usuario?: { id: number; nombre: string; correo: string };
  total: number;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
  direccion_envio: string;
  created_at: string;
  items?: ItemPedido[];
}

/**
 * DTO para la creación de un nuevo pedido.
 * Contiene los datos mínimos necesarios para crear un pedido
 * con sus items desde el frontend.
 */
export interface CrearPedidoDto {
  usuario_id: number;
  direccion_envio: string;
  items: {
    producto_id: number;
    variante_id: number | null;
    cantidad: number;
  }[];
}

/**
 * Servicio de pedidos.
 *
 * Gestiona todas las operaciones sobre pedidos: creación con validación
 * de stock, consulta paginada para el admin, historial del cliente
 * y actualización de estados con validación de transiciones.
 *
 * Todos los métodos requieren autenticación (token Sanctum).
 * Los admins ven todos los pedidos, los clientes solo los suyos.
 */
@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  /** URL base de la API del backend */
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los pedidos paginados para el panel de administración.
   * Los admins reciben todos los pedidos, los clientes solo los suyos.
   *
   * @param page Número de página (por defecto 1)
   * @returns Observable con la respuesta paginada
   */
  getAll(page: number = 1) {
    return this.http.get<PaginatedResponse<Pedido>>(
      `${this.apiUrl}/pedidos?page=${page}`
    );
  }

  /**
   * Obtiene todos los pedidos sin paginar para el historial del cliente.
   *
   * @returns Observable con el array de pedidos
   */
  getAllSinPaginar() {
    return this.http.get<PaginatedResponse<Pedido>>(
      `${this.apiUrl}/pedidos?per_page=100`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtiene un pedido por su ID con todos sus items y datos del usuario.
   *
   * @param id ID del pedido
   * @returns Observable con el pedido completo
   */
  getById(id: number) {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  /**
   * Crea un nuevo pedido.
   *
   * El backend valida el stock, descuenta las unidades y calcula
   * el total automáticamente dentro de una transacción.
   *
   * @param pedido DTO con los datos del pedido e items
   * @returns Observable con el pedido creado
   */
  crear(pedido: CrearPedidoDto) {
    return this.http.post<Pedido>(`${this.apiUrl}/pedidos`, pedido);
  }

  /**
   * Actualiza el estado de un pedido.
   *
   * El backend valida que la transición de estado sea válida
   * según el flujo: pendiente → pagado → enviado → entregado / cancelado.
   *
   * @param id     ID del pedido
   * @param estado Nuevo estado del pedido
   * @returns Observable con el pedido actualizado
   */
  actualizarEstado(id: number, estado: string) {
    return this.http.put<Pedido>(`${this.apiUrl}/pedidos/${id}`, { estado });
  }

  /**
   * Elimina un pedido.
   * Solo se permite eliminar pedidos en estado 'pendiente' o 'cancelado'.
   *
   * @param id ID del pedido a eliminar
   * @returns Observable vacío
   */
  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/pedidos/${id}`);
  }
}