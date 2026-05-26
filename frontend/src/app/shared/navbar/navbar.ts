import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito';
import { CarritoPanel } from '../carrito-panel/carrito-panel';

/**
 * Componente de barra de navegación principal.
 *
 * Muestra el logo, los enlaces de navegación y las acciones del usuario.
 * Gestiona el panel lateral del carrito mediante un signal booleano.
 *
 * Comportamiento según estado de autenticación:
 * - Usuario no autenticado: muestra enlaces a login y registro
 * - Usuario autenticado (cliente): muestra Mi cuenta y Cerrar sesión
 * - Usuario autenticado (admin): muestra además el enlace al Panel admin
 *
 * El badge del carrito muestra el número total de unidades
 * y se actualiza reactivamente mediante el signal totalItems.
 *
 * La navbar es sticky (position: sticky) para permanecer visible
 * al hacer scroll en la página.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CarritoPanel],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  /** Servicio de autenticación para verificar el estado y rol del usuario */
  auth = inject(AuthService);

  /** Servicio del carrito para mostrar el contador de items */
  carrito = inject(CarritoService);

  /**
   * Controla la visibilidad del panel lateral del carrito.
   * true = panel abierto, false = panel cerrado.
   */
  panelAbierto = signal<boolean>(false);

  /**
   * Abre el panel lateral del carrito.
   * Se llama al hacer clic en el icono del carrito.
   */
  abrirPanel() {
    this.panelAbierto.set(true);
  }

  /**
   * Cierra el panel lateral del carrito.
   * Se llama al hacer clic en el overlay o en el botón de cerrar del panel.
   */
  cerrarPanel() {
    this.panelAbierto.set(false);
  }
}