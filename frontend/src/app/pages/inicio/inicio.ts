import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto';

/**
 * Componente de la página de inicio.
 *
 * Muestra la página principal de CoffeLab con las siguientes secciones:
 * - Hero: imagen de banner con eslogan y enlace al catálogo
 * - Historia: descripción del origen y filosofía de la empresa
 * - Valores: cuatro pilares de la marca (trazabilidad, frescura, comercio justo, formación)
 * - Productos destacados: los 3 primeros productos del catálogo
 *
 * Los productos destacados se cargan al inicializar el componente
 * y se muestran como tarjetas con enlace al detalle de cada producto.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);

  /**
   * Signal con los 3 primeros productos del catálogo
   * para mostrar en la sección de productos destacados.
   */
  productosDestacados = signal<Producto[]>([]);

  /**
   * Carga los productos destacados al inicializar el componente.
   * Obtiene todos los productos y toma los 3 primeros.
   */
  ngOnInit() {
    this.productoService.getAllSinPaginar().subscribe(productos => {
      this.productosDestacados.set(productos.slice(0, 3));
    });
  }
}