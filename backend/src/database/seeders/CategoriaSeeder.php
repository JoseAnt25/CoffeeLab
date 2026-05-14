<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoriaSeeder extends Seeder
{
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