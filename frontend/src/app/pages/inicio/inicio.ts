import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);

  productosDestacados = signal<Producto[]>([]);

  ngOnInit() {
    this.productoService.getAllSinPaginar().subscribe(productos => {
      this.productosDestacados.set(productos.slice(0, 3));
    });
  }
}