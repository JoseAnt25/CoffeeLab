import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface Variante {
  id: number;
  producto_id: number;
  nombre: string;
  modificador_precio: number;
  stock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

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

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getAll(page: number = 1) {
    return this.http.get<PaginatedResponse<Producto>>(`${this.apiUrl}/productos?page=${page}`);
  }

  getAllSinPaginar() {
    return this.http.get<PaginatedResponse<Producto>>(`${this.apiUrl}/productos?per_page=100`).pipe(
      map(res => res.data)
    );
  }

  getById(id: number) {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  crear(producto: Partial<Producto>) {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  actualizar(id: number, producto: Partial<Producto>) {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  subirImagen(id: number, file: File) {
  const formData = new FormData();
  formData.append('imagen', file);
  return this.http.post<Producto>(`${this.apiUrl}/productos/${id}/imagen`, formData);
 }
}