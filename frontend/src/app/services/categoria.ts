import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  getById(id: number) {
    return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}`);
  }

  crear(categoria: Partial<Categoria>) {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, categoria);
  }

  actualizar(id: number, categoria: Partial<Categoria>) {
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, categoria);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }
}