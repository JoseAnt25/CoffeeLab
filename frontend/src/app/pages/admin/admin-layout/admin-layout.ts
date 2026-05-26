import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * @class AdminLayout
 * @description Componente de diseño (layout) principal para la zona de administración.
 * Actúa como un contenedor o "shell" que define la estructura base (como una barra de navegación o un menú lateral)
 * y utiliza `RouterOutlet` para renderizar dinámicamente las vistas hijas (rutas anidadas) del panel de administración.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  // Este componente sirve puramente como envoltorio visual y de enrutamiento.
  // Actualmente no requiere propiedades ni métodos adicionales para su funcionamiento.
}