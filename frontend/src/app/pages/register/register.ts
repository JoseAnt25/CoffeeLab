import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';

function contrasenasCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.get('contrasena')?.value;
  const confirmacion = control.get('contrasenaConfirmacion')?.value;
  return contrasena === confirmacion ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  error = signal<string | null>(null);
  cargando = signal<boolean>(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    contrasenaConfirmacion: ['', [Validators.required]],
  }, { validators: contrasenasCoincidenValidator });

  get nombre() { return this.form.get('nombre'); }
  get correo() { return this.form.get('correo'); }
  get contrasena() { return this.form.get('contrasena'); }
  get contrasenaConfirmacion() { return this.form.get('contrasenaConfirmacion'); }

  registrarse() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.authService.register({
      nombre: this.form.value.nombre!,
      correo: this.form.value.correo!,
      contrasena: this.form.value.contrasena!,
      contrasena_confirmation: this.form.value.contrasenaConfirmacion!,
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