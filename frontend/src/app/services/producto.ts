import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/**
 * Interfaz que representa una variante de producto.
 * Cada variante tiene su propio stock y modifica el precio base del producto.
 */
export interface Variante {
  id: number;
  producto_id: number;
  nombre: string;
  modificador_precio: number;
  stock: number;
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
 * Interfaz que representa un producto del catálogo.
 * imagen_url es un campo calculado que devuelve la URL absoluta de la imagen.
 */
export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  imagen_url: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  categoria?: { id: number; nombre: string; slug: string };
  variantes?: Variante[];
}

/**
 * Servicio de productos.
 *
 * Gestiona todas las operaciones CRUD sobre productos del catálogo,
 * incluyendo la subida de imágenes y la paginación para el panel admin.
 *
 * Los métodos getAll() y getAllSinPaginar() sirven para diferentes casos:
 * - getAll(): panel admin con paginación
 * - getAllSinPaginar(): catálogo público e inicio (carga todos los productos)
 */
@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  /** URL base de la API del backend */
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los productos paginados para el panel de administración.
   *
   * @param page Número de página (por defecto 1)
   * @returns Observable con la respuesta paginada (data, current_page, last_page, total)
   */
  getAll(page: number = 1) {
    return this.http.get<PaginatedResponse<Producto>>(
      `${this.apiUrl}/productos?page=${page}`
    );
  }

  /**
   * Obtiene todos los productos sin paginar para el catálogo público.
   *
   * Solicita hasta 100 productos por página y extrae solo el array data
   * para compatibilidad con los componentes que esperan un array simple.
   *
   * @returns Observable con el array de productos
   */
  getAllSinPaginar() {
    return this.http.get<PaginatedResponse<Producto>>(
      `${this.apiUrl}/productos?per_page=100`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtiene un producto por su ID con categoría y variantes.
   *
   * @param id ID del producto
   * @returns Observable con el producto completo
   */
  getById(id: number) {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  /**
   * Crea un nuevo producto en el catálogo.
   *
   * @param producto Datos del producto a crear
   * @returns Observable con el producto creado
   */
  crear(producto: Partial<Producto>) {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  /**
   * Actualiza un producto existente.
   *
   * @param id      ID del producto a actualizar
   * @param producto Campos a actualizar (parcial)
   * @returns Observable con el producto actualizado
   */
  actualizar(id: number, producto: Partial<Producto>) {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  /**
   * Elimina un producto del catálogo.
   * Si tiene pedidos asociados, el backend lo desactiva en lugar de eliminarlo.
   *
   * @param id ID del producto a eliminar
   * @returns Observable vacío
   */
  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  /**
   * Sube o reemplaza la imagen de un producto.
   *
   * Envía el archivo como multipart/form-data al endpoint dedicado.
   * El backend elimina la imagen anterior si existe antes de guardar la nueva.
   *
   * @param id   ID del producto
   * @param file Archivo de imagen (jpg, jpeg, png, webp, máx 2MB)
   * @returns Observable con el producto actualizado incluyendo la nueva imagen_url
   */
  subirImagen(id: number, file: File) {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<Producto>(
      `${this.apiUrl}/productos/${id}/imagen`,
      formData
    );
  }
}