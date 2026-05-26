<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeder de categorías de productos.
 *
 * Crea las categorías principales del catálogo de CoffeLab.
 * El slug se genera automáticamente a partir del nombre
 * usando el helper Str::slug de Laravel para URLs amigables.
 *
 * Categorías creadas:
 * - Café en grano  → slug: cafe-en-grano
 * - Cafeteras      → slug: cafeteras
 * - Accesorios     → slug: accesorios
 */
class CategoriaSeeder extends Seeder
{
    /**
     * Crea las categorías iniciales del catálogo.
     */
    public function run(): void
    {
        $categorias = [
            'Café en grano',
            'Cafeteras',
            'Accesorios',
        ];

        foreach ($categorias as $nombre) {
            Categoria::create([
                'nombre' => $nombre,
                'slug'   => Str::slug($nombre),
            ]);
        }
    }
}