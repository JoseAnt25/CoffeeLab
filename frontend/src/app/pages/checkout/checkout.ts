import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { PedidoService } from '../../services/pedido';

function direccionValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value?.trim();
  if (!valor) return { formatoInvalido: true };
  
  const partes = valor.split(',').map((p: string) => p.trim());
  return partes.length >= 4 && partes.every((p: string) => p.length > 0)
    ? null
    : { formatoInvalido: true };
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  usuario = this.authService.usuario;
  carritoItems = this.carritoService.items;
  total = this.carritoService.total;

  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  pedidoCreado = signal<boolean>(false);

  form = this.fb.group({
    direccion: ['', [Validators.required, direccionValidator]],
  });

  get direccion() { return this.form.get('direccion'); }

  ngOnInit() {
    if (this.carritoItems().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  tieneDireccion(): boolean {
    return !!this.usuario()?.direccion;
  }

  confirmarPedido() {
    const usuario = this.usuario();
    if (!usuario) return;

    let direccionEnvio = usuario.direccion;

    if (!this.tieneDireccion()) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      direccionEnvio = this.form.value.direccion!;
    }

    this.cargando.set(true);
    this.error.set(null);

    const pedido = {
      usuario_id: usuario.id,
      direccion_envio: direccionEnvio!,
      items: this.carritoItems().map(item => ({
        producto_id: item.producto.id,
        variante_id: item.variante?.id ?? null,
        cantidad: item.cantidad,
      })),
    };

    this.pedidoService.crear(pedido).subscribe({
      next: () => {
        this.carritoService.vaciar();
        this.pedidoCreado.set(true);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje ?? 'Error al crear el pedido.');
        this.cargando.set(false);
      },
    });
  }
}