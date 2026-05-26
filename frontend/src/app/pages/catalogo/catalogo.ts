import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto';
import { CategoriaService, Categoria } from '../../services/categoria';

/**
 * Componente de la página de catálogo de productos.
 *
 * Muestra todos los productos activos del catálogo con la posibilidad
 * de filtrarlos por categoría mediante botones de filtro.
 *
 * El filtrado se realiza en el cliente mediante un computed signal
 * que recalcula automáticamente los productos filtrados cuando cambia
 * la categoría seleccionada, sin necesidad de nuevas peticiones al servidor.
 *
 * Cada tarjeta de producto es clickable en su totalidad y navega
 * al detalle del producto al hacer clic.
 */
@Component({
  selector: 'app-catalogo',
  imports: [RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  /** Signal con todos los productos activos del catálogo */
  productos = signal<Producto[]>([]);

  /** Signal con todas las categorías disponibles para los filtros */
  categorias = signal<Categoria[]>([]);

  /**
   * Signal con la categoría actualmente seleccionada para filtrar.
   * null significa "mostrar todos los productos".
   */
  categoriaSeleccionada = signal<number | null>(null);

  /**
   * Computed signal con los productos filtrados por la categoría seleccionada.
   * Se recalcula automáticamente cuando cambia categoriaSeleccionada o productos.
   * Si no hay categoría seleccionada, devuelve todos los productos.
   */
  productosFiltrados = computed(() => {
    const cat = this.categoriaSeleccionada();
    if (!cat) return this.productos();
    return this.productos().filter(p => p.categoria_id === cat);
  });

  /**
   * Carga los productos y categorías al inicializar el componente.
   */
  ngOnInit() {
    this.productoService.getAllSinPaginar().subscribe(p => this.productos.set(p));
    this.categoriaService.getAll().subscribe(c => this.categorias.set(c));
  }

  /**
   * Establece el filtro de categoría activo.
   * Pasar null muestra todos los productos sin filtrar.
   *
   * @param categoriaId ID de la categoría a filtrar, o null para mostrar todos
   */
  filtrarPor(categoriaId: number | null) {
    this.categoriaSeleccionada.set(categoriaId);
  }
}