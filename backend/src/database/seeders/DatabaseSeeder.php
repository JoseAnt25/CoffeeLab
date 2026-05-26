<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder principal de la base de datos.
 *
 * Orquesta la ejecución de todos los seeders en el orden correcto
 * para respetar las dependencias entre tablas:
 * 1. Usuarios — necesario antes que pedidos
 * 2. Categorías — necesario antes que productos
 * 3. Productos — necesario antes que pedidos
 * 4. Pedidos — requiere usuarios y productos existentes
 *
 * Para ejecutar todos los seeders:
 * php artisan db:seed
 *
 * Para resetear y resembrar desde cero:
 * php artisan db:wipe && php artisan migrate && php artisan db:seed
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta los seeders en orden de dependencias.
     */
    public function run(): void
    {
        $this->call([
            UsuarioSeeder::class,
            CategoriaSeeder::class,
            ProductoSeeder::class,
            PedidoSeeder::class,
        ]);
    }
}