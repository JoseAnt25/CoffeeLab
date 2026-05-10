<?php

namespace Database\Seeders;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Database\Seeder;

class PedidoSeeder extends Seeder
{
    public function run(): void
    {
        $cliente = User::where('correo', 'cliente@coffelab.com')->first();
        $etiopia = Producto::where('nombre', 'Café Etiopía Yirgacheffe')->first();
        $molinillo = Producto::where('nombre', 'Molinillo de café manual')->first();

        // Pedido 1 - entregado
        $pedido1 = Pedido::create([
            'usuario_id'      => $cliente->id,
            'total'           => 49.80,
            'estado'          => 'entregado',
            'direccion_envio' => $cliente->direccion,
        ]);

        $pedido1->items()->createMany([
            [
                'producto_id'    => $etiopia->id,
                'variante_id'    => $etiopia->variantes->where('nombre', '500g')->first()->id,
                'cantidad'       => 1,
                'precio_unitario' => 23.40,
            ],
            [
                'producto_id'    => $molinillo->id,
                'variante_id'    => null,
                'cantidad'       => 1,
                'precio_unitario' => 34.90,
            ],
        ]);

        // Pedido 2 - pendiente
        $colombia = Producto::where('nombre', 'Café Colombia Huila')->first();

        $pedido2 = Pedido::create([
            'usuario_id'      => $cliente->id,
            'total'           => 12.90,
            'estado'          => 'pendiente',
            'direccion_envio' => $cliente->direccion,
        ]);

        $pedido2->items()->createMany([
            [
                'producto_id'    => $colombia->id,
                'variante_id'    => $colombia->variantes->where('nombre', '250g')->first()->id,
                'cantidad'       => 1,
                'precio_unitario' => 12.90,
            ],
        ]);
    }
}