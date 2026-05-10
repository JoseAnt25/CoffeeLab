import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  direccion: string | null;
  rol: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  usuario = signal<Usuario | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      this.usuario.set(JSON.parse(stored));
    }
  }

  login(correo: string, contrasena: string) {
    return this.http.post<{ usuario: Usuario; token: string }>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.usuario.set(res.usuario);
      })
    );
  }

  register(datos: { nombre: string; correo: string; contrasena: string; contrasena_confirmation: string }) {
    return this.http.post<{ usuario: Usuario; token: string }>(`${this.apiUrl}/register`, datos).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.usuario.set(res.usuario);
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  esAdmin(): boolean {
    return this.usuario()?.rol === 'admin';
  }
}