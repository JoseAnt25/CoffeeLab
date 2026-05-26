import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';

/**
 * Componente raíz de la aplicación CoffeLab.
 *
 * Define la estructura base de la aplicación con tres secciones:
 * - Navbar: barra de navegación fija en la parte superior
 * - RouterOutlet: área de contenido donde se renderizan las páginas
 * - Footer: pie de página con enlaces e información de contacto
 *
 * Este componente se monta en el elemento <app-root> del index.html
 * y actúa como contenedor principal de toda la aplicación.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}