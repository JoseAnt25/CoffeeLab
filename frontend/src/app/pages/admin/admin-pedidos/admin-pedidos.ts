import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../../../services/pedido';

/**
 * @class AdminPedidos
 * @description Componente del panel de administración para gestionar el listado completo de pedidos de la tienda.
 * Permite visualizar pedidos paginados, ver sus detalles y cambiar su estado de envío/pago.
 */
@Component({
  selector: 'app-admin-pedidos',
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css',
})
export class AdminPedidos implements OnInit {
  /** @private Servicio para interactuar con los datos de los pedidos en el backend. */
  private pedidoService = inject(PedidoService);

  /**
   * @type {Signal<Pedido[]>}
   * @description Señal que almacena el listado de pedidos de la página actualmente visualizada.
   */
  pedidos = signal<Pedido[]>([]);

  /**
   * @type {Signal<Pedido | null>}
   * @description Señal que almacena el pedido seleccionado actualmente para mostrar su vista de detalle (ej. en un modal).
   * Si es `null`, la vista de detalle permanece oculta.
   */
  pedidoDetalle = signal<Pedido | null>(null);

  /**
   * @type {Signal<number>}
   * @description Señal que rastrea el número de la página actual para la paginación de la tabla.
   */
  pagina = signal<number>(1);

  /**
   * @type {Signal<number>}
   * @description Señal que indica la última página disponible, devuelta por la API.
   */
  ultimaPagina = signal<number>(1);

  /**
   * @type {Signal<number>}
   * @description Señal con la cantidad total de pedidos registrados en la base de datos.
   */
  total = signal<number>(0);

  /**
   * @type {string[]}
   * @description Opciones disponibles para cambiar el estado operativo o logístico de un pedido.
   */
  estados = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

  /**
   * @method ngOnInit
   * @description Hook del ciclo de vida que se ejecuta al montar el componente.
   * Dispara la carga de la primera página de pedidos.
   */
  ngOnInit() {
    this.cargarPedidos();
  }

  /**
   * @method cargarPedidos
   * @description Solicita al servicio de pedidos la lista correspondiente a la página actual.
   * Actualiza las señales de listado, última página y total con la respuesta del servidor.
   * @returns {void}
   */
  cargarPedidos() {
    this.pedidoService.getAll(this.pagina()).subscribe(res => {
      this.pedidos.set(res.data);
      this.ultimaPagina.set(res.last_page);
      this.total.set(res.total);
    });
  }

  /**
   * @method irPagina
   * @description Actualiza la señal de la página actual y vuelve a cargar los registros.
   * @param {number} pagina El número de la página a la que se desea navegar.
   * @returns {void}
   */
  irPagina(pagina: number) {
    this.pagina.set(pagina);
    this.cargarPedidos();
  }

  /**
   * @method verDetalle
   * @description Carga un pedido en la señal `pedidoDetalle` para desplegar su información completa en la interfaz.
   * @param {Pedido} pedido El objeto pedido que se desea inspeccionar.
   * @returns {void}
   */
  verDetalle(pedido: Pedido) {
    this.pedidoDetalle.set(pedido);
  }

  /**
   * @method cerrarDetalle
   * @description Limpia la señal `pedidoDetalle`, lo que oculta la vista detallada en la UI.
   * @returns {void}
   */
  cerrarDetalle() {
    this.pedidoDetalle.set(null);
  }

  /**
   * @method cambiarEstado
   * @description Envía una petición para cambiar el estado de un pedido específico.
   * Actualiza el registro localmente si tiene éxito. Si falla, muestra una alerta y revierte el cambio recargando los datos.
   * @param {Pedido} pedido El pedido que va a modificar su estado.
   * @param {Event} event El evento del DOM generado por el elemento `<select>`.
   * @returns {void}
   */
  cambiarEstado(pedido: Pedido, event: Event) {
    // Extrae el valor seleccionado del elemento HTML
    const estado = (event.target as HTMLSelectElement).value;
    
    this.pedidoService.actualizarEstado(pedido.id, estado).subscribe({
      next: (p) => {
        // Actualiza el pedido modificado en el array de la página actual de forma reactiva
        this.pedidos.update(pedidos =>
          pedidos.map(item => item.id === p.id ? p : item)
        );
      },
      error: (err) => {
        // Muestra el mensaje de error del servidor o uno por defecto
        alert(err.error?.mensaje ?? 'No se puede realizar ese cambio de estado.');
        // Recarga la tabla para revertir el estado visual del <select> a su valor real
        this.cargarPedidos();
      }
    });
  }

  /**
   * @method estadoClase
   * @description Devuelve una clase CSS específica según el estado actual del pedido, permitiendo un estilizado dinámico (ej. colores).
   * @param {string} estado El estado del pedido.
   * @returns {string} El nombre de la clase CSS a aplicar.
   */
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