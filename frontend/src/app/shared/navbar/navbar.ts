import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito';
import { CarritoPanel } from '../carrito-panel/carrito-panel';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CarritoPanel],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  carrito = inject(CarritoService);

  panelAbierto = signal<boolean>(false);

  abrirPanel() {
    this.panelAbierto.set(true);
  }

  cerrarPanel() {
    this.panelAbierto.set(false);
  }
}