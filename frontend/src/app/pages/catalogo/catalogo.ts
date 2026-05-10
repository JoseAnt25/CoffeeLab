import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto';
import { CategoriaService, Categoria } from '../../services/categoria';

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriaSeleccionada = signal<number | null>(null);

  productosFiltrados = computed(() => {
    const cat = this.categoriaSeleccionada();
    if (!cat) return this.productos();
    return this.productos().filter(p => p.categoria_id === cat);
  });

  ngOnInit() {
    this.productoService.getAll().subscribe(p => this.productos.set(p));
    this.categoriaService.getAll().subscribe(c => this.categorias.set(c));
  }

  filtrarPor(categoriaId: number | null) {
    this.categoriaSeleccionada.set(categoriaId);
  }
}