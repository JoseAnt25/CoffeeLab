import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombre = signal<string>('');
  correo = signal<string>('');
  contrasena = signal<string>('');
  contrasenaConfirmacion = signal<string>('');
  error = signal<string | null>(null);
  cargando = signal<boolean>(false);

  registrarse() {
    if (this.contrasena() !== this.contrasenaConfirmacion()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.authService.register({
      nombre: this.nombre(),
      correo: this.correo(),
      contrasena: this.contrasena(),
      contrasena_confirmation: this.contrasenaConfirmacion(),
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al registrarse.');
        this.cargando.set(false);
      },
    });
  }
}