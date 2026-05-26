import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Interfaz que representa una categoría de productos.
 * El slug se genera automáticamente en el backend a partir del nombre.
 */
export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

/**
 * Servicio de categorías.
 *
 * Gestiona todas las operaciones CRUD sobre las categorías del catálogo.
 * Las rutas de lectura (getAll, getById) son públicas y no requieren autenticación.
 * Las rutas de escritura (crear, actualizar, eliminar) requieren token de admin.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  /** URL base de la API del backend */
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías disponibles.
   * Ruta pública, no requiere autenticación.
   *
   * @returns Observable con el array de categorías
   */
  getAll() {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  /**
   * Obtiene una categoría por su ID con sus productos asociados.
   * Ruta pública, no requiere autenticación.
   *
   * @param id ID de la categoría
   * @returns Observable con la categoría y sus productos
   */
  getById(id: number) {
    return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}`);
  }

  /**
   * Crea una nueva categoría.
   * Requiere token de administrador.
   *
   * @param categoria Datos de la categoría (nombre)
   * @returns Observable con la categoría creada incluyendo el slug generado
   */
  crear(categoria: Partial<Categoria>) {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, categoria);
  }

  /**
   * Actualiza una categoría existente.
   * Requiere token de administrador.
   * Si se actualiza el nombre, el backend regenera el slug automáticamente.
   *
   * @param id        ID de la categoría a actualizar
   * @param categoria Campos a actualizar (parcial)
   * @returns Observable con la categoría actualizada
   */
  actualizar(id: number, categoria: Partial<Categoria>) {
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, categoria);
  }

  /**
   * Elimina una categoría.
   * Requiere token de administrador.
   * El backend no permite eliminar categorías con productos asociados.
   *
   * @param id ID de la categoría a eliminar
   * @returns Observable vacío
   */
  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }
}