import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductoService, Producto, Variante } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-detalle-producto',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  auth = inject(AuthService);

  producto = signal<Producto | null>(null);
  varianteSeleccionada = signal<Variante | null>(null);
  cantidad = signal<number>(1);
  agregado = signal<boolean>(false);
  subiendoImagen = signal<boolean>(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.getById(id).subscribe(p => {
      this.producto.set(p);
      if (p.variantes && p.variantes.length > 0) {
        this.varianteSeleccionada.set(p.variantes[0]);
      }
    });
  }

  seleccionarVariante(variante: Variante) {
    this.varianteSeleccionada.set(variante);
  }

  precioFinal(): number {
    const producto = this.producto();
    const variante = this.varianteSeleccionada();
    if (!producto) return 0;
    return Number(producto.precio) + (variante ? Number(variante.modificador_precio) : 0);
  }

  incrementar() {
    this.cantidad.update(c => c + 1);
  }

  decrementar() {
    if (this.cantidad() > 1) this.cantidad.update(c => c - 1);
  }

  agregarAlCarrito() {
    const producto = this.producto();
    if (!producto) return;
    this.carritoService.agregar(producto, this.varianteSeleccionada(), this.cantidad());
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  onImagenSeleccionada(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const producto = this.producto();
    if (!file || !producto) return;

    this.subiendoImagen.set(true);
    this.productoService.subirImagen(producto.id, file).subscribe({
      next: (p) => {
        this.producto.set(p);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.subiendoImagen.set(false);
      }
    });
  }
}