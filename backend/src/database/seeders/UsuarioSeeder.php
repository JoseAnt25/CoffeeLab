<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de usuarios de prueba.
 *
 * Crea dos usuarios iniciales para desarrollo y pruebas:
 * - Un administrador con acceso al panel de administración
 * - Un cliente de demostración para probar el flujo de compra
 *
 * Usa firstOrCreate para evitar duplicados si se ejecuta
 * el seeder varias veces sin hacer db:wipe previamente.
 *
 * Credenciales de acceso:
 * - Admin:   admin@coffelab.com   / password123
 * - Cliente: cliente@coffelab.com / password123
 */
class UsuarioSeeder extends Seeder
{
    /**
     * Crea los usuarios de prueba en la base de datos.
     */
    public function run(): void
    {
        $usuarios = [
            [
                'nombre'     => 'Administrador',
                'correo'     => 'admin@coffelab.com',
                'contrasena' => Hash::make('password123'),
                'direccion'  => 'Calle Mayor 1, Madrid',
                'rol'        => 'admin',
            ],
            [
                'nombre'     => 'Cliente Demo',
                'correo'     => 'cliente@coffelab.com',
                'contrasena' => Hash::make('password123'),
                'direccion'  => 'Avenida del Café 42, Barcelona',
                'rol'        => 'cliente',
            ],
        ];

        foreach ($usuarios as $data) {
            // firstOrCreate evita duplicados si el seeder se ejecuta varias veces
            User::firstOrCreate(
                ['correo' => $data['correo']],
                $data
            );
        }
    }
}