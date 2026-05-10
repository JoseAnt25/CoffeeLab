<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $productos = [
            [
                'categoria_id' => 1, // Café en grano
                'nombre'       => 'Café Etiopía Yirgacheffe',
                'descripcion'  => 'Café de especialidad con notas a frutos rojos, jazmín y cítricos. Tostado medio.',
                'precio'       => 14.90,
                'stock'        => 100,
                'activo'       => true,
                'variantes'    => [
                    ['nombre' => '250g', 'modificador_precio' => 0,    'stock' => 40],
                    ['nombre' => '500g', 'modificador_precio' => 8.50,  'stock' => 40],
                    ['nombre' => '1kg',  'modificador_precio' => 19.00, 'stock' => 20],
                ],
            ],
            [
                'categoria_id' => 1, // Café en grano
                'nombre'       => 'Café Colombia Huila',
                'descripcion'  => 'Café suave con notas a caramelo, nuez y chocolate. Tostado medio-oscuro.',
                'precio'       => 12.90,
                'stock'        => 80,
                'activo'       => true,
                'variantes'    => [
                    ['nombre' => '250g', 'modificador_precio' => 0,    'stock' => 30],
                    ['nombre' => '500g', 'modificador_precio' => 7.50,  'stock' => 30],
                    ['nombre' => '1kg',  'modificador_precio' => 17.00, 'stock' => 20],
                ],
            ],
            [
                'categoria_id' => 2, // Cafeteras
                'nombre'       => 'Cafetera Italiana Bialetti Moka Express',
                'descripcion'  => 'La cafetera italiana clásica. Fabricada en aluminio de alta calidad.',
                'precio'       => 29.90,
                'stock'        => 50,
                'activo'       => true,
                'variantes'    => [
                    ['nombre' => '3 tazas', 'modificador_precio' => 0,    'stock' => 20],
                    ['nombre' => '6 tazas', 'modificador_precio' => 8.00,  'stock' => 20],
                    ['nombre' => '9 tazas', 'modificador_precio' => 15.00, 'stock' => 10],
                ],
            ],
            [
                'categoria_id' => 2, // Cafeteras
                'nombre'       => 'Cafetera de Émbolo French Press',
                'descripcion'  => 'Cafetera de émbolo para un café rico y aromático. Capacidad 1L.',
                'precio'       => 24.90,
                'stock'        => 40,
                'activo'       => true,
                'variantes'    => [],
            ],
            [
                'categoria_id' => 3, // Accesorios
                'nombre'       => 'Molinillo de café manual',
                'descripcion'  => 'Molinillo cerámico con ajuste de grosor. Compacto y portátil.',
                'precio'       => 34.90,
                'stock'        => 30,
                'activo'       => true,
                'variantes'    => [],
            ],
            [
                'categoria_id' => 3, // Accesorios
                'nombre'       => 'Báscula de precisión para café',
                'descripcion'  => 'Báscula digital con temporizador integrado. Precisión de 0.1g.',
                'precio'       => 19.90,
                'stock'        => 25,
                'activo'       => true,
                'variantes'    => [],
            ],
        ];

        foreach ($productos as $data) {
            $variantes = $data['variantes'];
            unset($data['variantes']);

            $producto = Producto::create($data);

            if (!empty($variantes)) {
                $producto->variantes()->createMany($variantes);
            }
        }
    }
}