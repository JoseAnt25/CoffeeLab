import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Variante {
  id: number;
  producto_id: number;
  nombre: string;
  modificador_precio: number;
  stock: number;
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

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
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
  formData.append('_method', 'PUT');
  return this.http.post<Producto>(`${this.apiUrl}/productos/${id}`, formData);
  }
}