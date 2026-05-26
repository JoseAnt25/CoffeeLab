import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductoService, Producto, Variante } from '../../../services/producto';
import { CategoriaService, Categoria } from '../../../services/categoria';
import { HttpClient } from '@angular/common/http';

/**
 * @interface FormProducto
 * @description Estructura de datos que representa los campos principales del formulario de un producto.
 */
interface FormProducto {
  categoria_id: number | null;
  nombre: string;
  descripcion: string;
  precio: number | null;
  stock: number | null;
  activo: boolean;
}

/**
 * @interface FormVariante
 * @description Estructura de datos utilizada para la captura de información al crear una nueva variante de producto.
 */
interface FormVariante {
  nombre: string;
  modificador_precio: number;
  stock: number;
}

/**
 * @class AdminProductos
 * @description Componente del panel de administración encargado de gestionar el CRUD (Crear, Leer, Actualizar, Eliminar) 
 * de productos, incluyendo la gestión de sus categorías, imágenes y variantes (ej. tallas, colores).
 */
@Component({
  selector: 'app-admin-productos',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductos implements OnInit {
  /** @private Servicio para interactuar con la API de productos. */
  private productoService = inject(ProductoService);
  
  /** @private Servicio para obtener el listado de categorías disponibles. */
  private categoriaService = inject(CategoriaService);
  
  /** @private Cliente HTTP para peticiones manuales (usado aquí para las variantes). */
  private http = inject(HttpClient);

  /** @private URL base de la API. */
  private apiUrl = 'http://localhost:8000/api';

  /** @description Señal que almacena el listado paginado de productos. */
  productos = signal<Producto[]>([]);
  
  /** @description Señal que almacena todas las categorías disponibles para el selector del formulario. */
  categorias = signal<Categoria[]>([]);
  
  /** @description Señal que controla la visibilidad del modal o sección del formulario de creación/edición. */
  mostrarFormulario = signal<boolean>(false);
  
  /** @description Señal que guarda el producto que se está editando actualmente. Es `null` si se está creando uno nuevo. */
  productoEditando = signal<Producto | null>(null);
  
  /** @description Señal para el control de la página actual en la tabla de productos. */
  pagina = signal<number>(1);
  
  /** @description Señal que almacena el número máximo de páginas disponibles devueltas por la API. */
  ultimaPagina = signal<number>(1);
  
  /** @description Señal con la cantidad total de productos en la base de datos. */
  total = signal<number>(0);
  
  /** @description Señal que indica si hay una petición de guardado en curso (para mostrar spinners/bloquear botones). */
  cargando = signal<boolean>(false);
  
  /** @description Señal para almacenar y mostrar mensajes de error provenientes del servidor. */
  error = signal<string | null>(null);

  /** @description Objeto vinculado mediante ngModel al formulario principal del producto. */
  form: FormProducto = this.formVacio();
  
  /** @description Señal que mantiene la lista temporal o real de variantes asociadas al producto en el formulario. */
  variantes = signal<Variante[]>([]);
  
  /** @description Objeto vinculado al sub-formulario de creación de una nueva variante. */
  nuevaVariante: FormVariante = this.varianteVacia();

  /**
   * @method ngOnInit
   * @description Hook de inicialización. Carga la primera página de productos y el catálogo completo de categorías.
   */
  ngOnInit() {
    this.cargarProductos();
    this.categoriaService.getAll().subscribe(c => this.categorias.set(c));
  }

  /**
   * @method cargarProductos
   * @description Solicita al backend los productos de la página actual y actualiza las señales de paginación.
   * @returns {void}
   */
  cargarProductos() {
    this.productoService.getAll(this.pagina()).subscribe(res => {
      this.productos.set(res.data);
      this.ultimaPagina.set(res.last_page);
      this.total.set(res.total);
    });
  }

  /**
   * @method irPagina
   * @description Navega a una página específica del listado de productos.
   * @param {number} pagina El número de página a consultar.
   * @returns {void}
   */
  irPagina(pagina: number) {
    this.pagina.set(pagina);
    this.cargarProductos();
  }

  /**
   * @method formVacio
   * @description Genera un estado inicial limpio para el formulario de productos.
   * @returns {FormProducto} Un objeto con campos vacíos o valores por defecto.
   */
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

  /**
   * @method varianteVacia
   * @description Genera un estado inicial limpio para el sub-formulario de variantes.
   * @returns {FormVariante} Un objeto con los campos de la variante reiniciados.
   */
  varianteVacia(): FormVariante {
    return { nombre: '', modificador_precio: 0, stock: 0 };
  }

  /**
   * @method abrirCrear
   * @description Prepara el entorno visual y los datos para registrar un producto completamente nuevo.
   * @returns {void}
   */
  abrirCrear() {
    this.form = this.formVacio();
    this.variantes.set([]);
    this.nuevaVariante = this.varianteVacia();
    this.productoEditando.set(null);
    this.mostrarFormulario.set(true);
  }

  /**
   * @method abrirEditar
   * @description Carga los datos de un producto existente en el formulario para su modificación.
   * @param {Producto} producto El objeto producto que se desea editar.
   * @returns {void}
   */
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

  /**
   * @method cerrarFormulario
   * @description Oculta el formulario de creación/edición y limpia cualquier mensaje de error visible.
   * @returns {void}
   */
  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  /**
   * @method agregarVariante
   * @description Añade una nueva variante a la lista. 
   * Si se está editando un producto, hace una petición POST inmediata a la API para persistirla. 
   * Si es un producto nuevo, solo la añade a la señal local (se guardará junto con el producto al final).
   * @returns {void}
   */
  agregarVariante() {
    if (!this.nuevaVariante.nombre) return;
    const editando = this.productoEditando();

    if (editando) {
      // Petición al backend si el producto ya existe
      this.http.post<Variante>(`${this.apiUrl}/productos/${editando.id}/variantes`, this.nuevaVariante)
        .subscribe(v => {
          this.variantes.update(vars => [...vars, v]);
          this.nuevaVariante = this.varianteVacia();
        });
    } else {
      // Guardado temporal en memoria si el producto es nuevo
      this.variantes.update(vars => [...vars, { ...this.nuevaVariante, id: Date.now(), producto_id: 0 }]);
      this.nuevaVariante = this.varianteVacia();
    }
  }

  /**
   * @method eliminarVariante
   * @description Elimina una variante de la lista.
   * Al igual que al añadir, si el producto existe, hace una petición DELETE a la API. Si no, solo la borra de memoria.
   * @param {Variante} variante La variante a eliminar.
   * @returns {void}
   */
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

  /**
   * @method guardar
   * @description Recopila los datos del formulario y las variantes (si es nuevo) y envía la petición de creación o actualización.
   * @returns {void}
   */
  guardar() {
    this.cargando.set(true);
    this.error.set(null);

    const editando = this.productoEditando();

    // Preparación del payload base
    const datos: any = {
      categoria_id: this.form.categoria_id!,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion,
      precio: this.form.precio!,
      stock: this.form.stock!,
      activo: this.form.activo,
    };

    // Solo se envían las variantes en la creación. En la edición se gestionaron individualmente.
    if (!editando) {
      datos.variantes = this.variantes();
    }

    // Decide qué método del servicio utilizar basándose en si existe 'productoEditando'
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

  /**
   * @method eliminar
   * @description Pide confirmación al usuario y elimina un producto a través de la API, recargando luego la lista.
   * @param {Producto} producto El producto que se desea eliminar.
   * @returns {void}
   */
  eliminar(producto: Producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    this.productoService.eliminar(producto.id).subscribe(() => this.cargarProductos());
  }

  /**
   * @method subirImagen
   * @description Captura un archivo desde un input de tipo file y lo sube al servidor asociado al producto.
   * @param {Producto} producto El producto al que se le asociará la imagen.
   * @param {Event} event El evento de cambio (change) proveniente del input file.
   * @returns {void}
   */
  subirImagen(producto: Producto, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.productoService.subirImagen(producto.id, file).subscribe(() => this.cargarProductos());
  }
}