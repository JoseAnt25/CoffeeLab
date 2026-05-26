import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de pie de página.
 *
 * Muestra información de la marca, enlaces de navegación
 * y datos de contacto de CoffeLab.
 *
 * El año de copyright se calcula dinámicamente para que
 * se actualice automáticamente cada año sin necesidad de
 * modificar el código.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  /**
   * Año actual para mostrar en el copyright.
   * Se calcula en el momento de instanciar el componente.
   */
  anio = new Date().getFullYear();
}