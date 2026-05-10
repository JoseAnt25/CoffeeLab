<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
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
            User::firstOrCreate(
                ['correo' => $data['correo']],
                $data
            );
        }
    }
}