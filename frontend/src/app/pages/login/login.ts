import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  correo = signal<string>('');
  contrasena = signal<string>('');
  error = signal<string | null>(null);
  cargando = signal<boolean>(false);

  iniciarSesion() {
    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.correo(), this.contrasena()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error.set('Correo o contraseña incorrectos.');
        this.cargando.set(false);
      },
    });
  }
}