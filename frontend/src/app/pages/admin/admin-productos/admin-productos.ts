import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductoService, Producto, Variante } from '../../../services/producto';
import { CategoriaService, Categoria } from '../../../services/categoria';
import { HttpClient } from '@angular/common/http';

interface FormProducto {
  categoria_id: number | null;
  nombre: string;
  descripcion: string;
  precio: number | null;
  stock: number | null;
  activo: boolean;
}

interface FormVariante {
  nombre: string;
  modificador_precio: number;
  stock: number;
}

@Component({
  selector: 'app-admin-productos',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/api';

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  mostrarFormulario = signal<boolean>(false);
  productoEditando = signal<Producto | null>(null);
  pagina = signal<number>(1);
  ultimaPagina = signal<number>(1);
  total = signal<number>(0);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  form: FormProducto = this.formVacio();
  variantes = signal<Variante[]>([]);
  nuevaVariante: FormVariante = this.varianteVacia();

  ngOnInit() {
    this.cargarProductos();
    this.categoriaService.getAll().subscribe(c => this.categorias.set(c));
  }

  cargarProductos() {
    this.productoService.getAll(this.pagina()).subscribe(res => {
      this.productos.set(res.data);
      this.ultimaPagina.set(res.last_page);
      this.total.set(res.total);
    });
  }

  irPagina(pagina: number) {
    this.pagina.set(pagina);
    this.cargarProductos();
  }

  formVacio(): FormProducto {
    return {
      categoria_id: null,
      nombre: '',
      descripcion: '',
      precio: null,
      stock: null,
      activo: true,
    };
  }

  varianteVacia(): FormVariante {
    return { nombre: '', modificador_precio: 0, stock: 0 };
  }

  abrirCrear() {
    this.form = this.formVacio();
    this.variantes.set([]);
    this.nuevaVariante = this.varianteVacia();
    this.productoEditando.set(null);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(producto: Producto) {
    this.form = {
      categoria_id: producto.categoria_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      stock: producto.stock,
      activo: producto.activo,
    };
    this.variantes.set(producto.variantes ?? []);
    this.nuevaVariante = this.varianteVacia();
    this.productoEditando.set(producto);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  agregarVariante() {
    if (!this.nuevaVariante.nombre) return;
    const editando = this.productoEditando();

    if (editando) {
      this.http.post<Variante>(`${this.apiUrl}/productos/${editando.id}/variantes`, this.nuevaVariante)
        .subscribe(v => {
          this.variantes.update(vars => [...vars, v]);
          this.nuevaVariante = this.varianteVacia();
        });
    } else {
      this.variantes.update(vars => [...vars, { ...this.nuevaVariante, id: Date.now(), producto_id: 0 }]);
      this.nuevaVariante = this.varianteVacia();
    }
  }

  eliminarVariante(variante: Variante) {
    const editando = this.productoEditando();
    if (editando) {
      this.http.delete(`${this.apiUrl}/variantes/${variante.id}`)
        .subscribe(() => {
          this.variantes.update(vars => vars.filter(v => v.id !== variante.id));
        });
    } else {
      this.variantes.update(vars => vars.filter(v => v.id !== variante.id));
    }
  }

  guardar() {
    this.cargando.set(true);
    this.error.set(null);

    const editando = this.productoEditando();

    const datos: any = {
      categoria_id: this.form.categoria_id!,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion,
      precio: this.form.precio!,
      stock: this.form.stock!,
      activo: this.form.activo,
    };

    if (!editando) {
      datos.variantes = this.variantes();
    }

    const obs = editando
      ? this.productoService.actualizar(editando.id, datos)
      : this.productoService.crear(datos);

    obs.subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarFormulario();
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al guardar el producto.');
        this.cargando.set(false);
      },
    });
  }

  eliminar(producto: Producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    this.productoService.eliminar(producto.id).subscribe(() => this.cargarProductos());
  }

  subirImagen(producto: Producto, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.productoService.subirImagen(producto.id, file).subscribe(() => this.cargarProductos());
  }
}