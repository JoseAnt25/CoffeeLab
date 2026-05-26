<?php

namespace Database\Seeders;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder de pedidos de prueba.
 *
 * Crea dos pedidos de ejemplo para el usuario cliente de demostración,
 * simulando diferentes estados del ciclo de vida de un pedido:
 *
 * Pedido 1 (entregado):
 * - Café Etiopía Yirgacheffe 500g x1 = 23.40€
 * - Molinillo de café manual x1 = 34.90€
 * - Total: 49.80€ (nota: el total refleja un descuento o precio anterior)
 *
 * Pedido 2 (pendiente):
 * - Café Colombia Huila 250g x1 = 12.90€
 * - Total: 12.90€
 */
class PedidoSeeder extends Seeder
{
    /**
     * Crea los pedidos de prueba con sus items.
     *
     * Busca los productos y el usuario por nombre/correo para
     * evitar dependencias en IDs que pueden variar entre entornos.
     */
    public function run(): void
    {
        $cliente   = User::where('correo', 'cliente@coffelab.com')->first();
        $etiopia   = Producto::where('nombre', 'Café Etiopía Yirgacheffe')->first();
        $molinillo = Producto::where('nombre', 'Molinillo de café manual')->first();

        // Pedido 1 — estado: entregado (simula un pedido completado)
        $pedido1 = Pedido::create([
            'usuario_id'      => $cliente->id,
            'total'           => 49.80,
            'estado'          => 'entregado',
            'direccion_envio' => $cliente->direccion,
        ]);

        $pedido1->items()->createMany([
            [
                'producto_id'     => $etiopia->id,
                'variante_id'     => $etiopia->variantes->where('nombre', '500g')->first()->id,
                'cantidad'        => 1,
                'precio_unitario' => 23.40,
            ],
            [
                'producto_id'     => $molinillo->id,
                'variante_id'     => null,
                'cantidad'        => 1,
                'precio_unitario' => 34.90,
            ],
        ]);

        // Pedido 2 — estado: pendiente (simula un pedido recién creado)
        $colombia = Producto::where('nombre', 'Café Colombia Huila')->first();

        $pedido2 = Pedido::create([
            'usuario_id'      => $cliente->id,
            'total'           => 12.90,
            'estado'          => 'pendiente',
            'direccion_envio' => $cliente->direccion,
        ]);

        $pedido2->items()->createMany([
            [
                'producto_id'     => $colombia->id,
                'variante_id'     => $colombia->variantes->where('nombre', '250g')->first()->id,
                'cantidad'        => 1,
                'precio_unitario' => 12.90,
            ],
        ]);
    }
}