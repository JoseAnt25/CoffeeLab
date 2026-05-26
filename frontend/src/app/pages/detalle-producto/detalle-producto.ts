import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductoService, Producto, Variante } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';

/**
 * Componente de detalle de producto.
 *
 * Muestra toda la información de un producto específico:
 * imagen, categoría, nombre, descripción, variantes disponibles,
 * precio final (base + modificador de variante) y control de cantidad.
 *
 * Funcionalidades:
 * - Selección de variante con actualización reactiva del precio
 * - Control de cantidad con botones de incremento/decremento
 * - Añadir al carrito con feedback visual temporal (2 segundos)
 * - Subida de imagen (solo visible para administradores)
 *
 * El ID del producto se obtiene de los parámetros de la ruta (/catalogo/:id).
 * Si el producto tiene variantes, se preselecciona la primera automáticamente.
 */
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

  /** Servicio de autenticación para mostrar el botón de imagen solo a admins */
  auth = inject(AuthService);

  /** Signal con los datos del producto cargado desde la API */
  producto = signal<Producto | null>(null);

  /**
   * Signal con la variante actualmente seleccionada.
   * Se inicializa con la primera variante disponible si existe.
   */
  varianteSeleccionada = signal<Variante | null>(null);

  /** Signal con la cantidad seleccionada para añadir al carrito */
  cantidad = signal<number>(1);

  /**
   * Signal de feedback visual al añadir al carrito.
   * Se activa durante 2 segundos tras añadir el producto.
   */
  agregado = signal<boolean>(false);

  /** Signal que indica si se está subiendo una imagen */
  subiendoImagen = signal<boolean>(false);

  /**
   * Carga el producto por ID al inicializar el componente.
   * El ID se obtiene del parámetro de ruta :id.
   * Si el producto tiene variantes, preselecciona la primera.
   */
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.getById(id).subscribe(p => {
      this.producto.set(p);
      if (p.variantes && p.variantes.length > 0) {
        this.varianteSeleccionada.set(p.variantes[0]);
      }
    });
  }

  /**
   * Selecciona una variante y actualiza el precio mostrado.
   *
   * @param variante Variante seleccionada por el usuario
   */
  seleccionarVariante(variante: Variante) {
    this.varianteSeleccionada.set(variante);
  }

  /**
   * Calcula el precio final del producto con la variante seleccionada.
   * Precio final = precio base + modificador de precio de la variante.
   *
   * @returns Precio final como número, 0 si no hay producto cargado
   */
  precioFinal(): number {
    const producto = this.producto();
    const variante = this.varianteSeleccionada();
    if (!producto) return 0;
    return Number(producto.precio) + (variante ? Number(variante.modificador_precio) : 0);
  }

  /**
   * Incrementa la cantidad seleccionada en 1.
   */
  incrementar() {
    this.cantidad.update(c => c + 1);
  }

  /**
   * Decrementa la cantidad seleccionada en 1.
   * No permite valores menores que 1.
   */
  decrementar() {
    if (this.cantidad() > 1) this.cantidad.update(c => c - 1);
  }

  /**
   * Añade el producto al carrito con la variante y cantidad seleccionadas.
   * Muestra un feedback visual durante 2 segundos tras añadir.
   */
  agregarAlCarrito() {
    const producto = this.producto();
    if (!producto) return;
    this.carritoService.agregar(producto, this.varianteSeleccionada(), this.cantidad());
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  /**
   * Gestiona la subida de imagen del producto (solo para admins).
   * Actualiza el signal producto con los nuevos datos incluyendo imagen_url.
   *
   * @param event Evento del input file con el archivo seleccionado
   */
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