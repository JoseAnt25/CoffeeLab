import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PedidoService, Pedido } from '../../services/pedido';

function direccionValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value?.trim();
  if (!valor) return { formatoInvalido: true };
  
  const partes = valor.split(',').map((p: string) => p.trim());
  return partes.length >= 4 && partes.every((p: string) => p.length > 0)
    ? null
    : { formatoInvalido: true };
}

@Component({
  selector: 'app-mi-cuenta',
  imports: [RouterLink, DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta implements OnInit {
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private fb = inject(FormBuilder);

  usuario = this.authService.usuario;
  pedidos = signal<Pedido[]>([]);

  editandoDireccion = signal<boolean>(false);
  guardando = signal<boolean>(false);

  form = this.fb.group({
    direccion: ['', [Validators.required, direccionValidator]],
  });

  get direccion() { return this.form.get('direccion'); }

  ngOnInit() {
    this.pedidoService.getAllSinPaginar().subscribe(p => this.pedidos.set(p));
  }

  cerrarSesion() {
    this.authService.logout();
  }

  abrirEditarDireccion() {
    this.form.patchValue({ direccion: this.usuario()?.direccion ?? '' });
    this.editandoDireccion.set(true);
  }

  cerrarEditarDireccion() {
    this.editandoDireccion.set(false);
    this.form.reset();
  }

  guardarDireccion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);

    this.authService.actualizar({ direccion: this.form.value.direccion! }).subscribe({
      next: () => {
        this.cerrarEditarDireccion();
        this.guardando.set(false);
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  estadoClase(estado: string): string {
    const clases: Record<string, string> = {
      pendiente: 'estado-pendiente',
      pagado: 'estado-pagado',
      enviado: 'estado-enviado',
      entregado: 'estado-entregado',
      cancelado: 'estado-cancelado',
    };
    return clases[estado] ?? '';
  }
}