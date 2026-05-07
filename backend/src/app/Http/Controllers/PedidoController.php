<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function index(): JsonResponse
    {
        $pedidos = Pedido::with(['items.producto', 'items.variante', 'usuario'])
            ->get();

        return response()->json($pedidos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'usuario_id'                => 'required|exists:usuarios,id',
            'direccion_envio'           => 'required|string|max:255',
            'items'                     => 'required|array|min:1',
            'items.*.producto_id'       => 'required|exists:productos,id',
            'items.*.variante_id'       => 'nullable|exists:variantes_producto,id',
            'items.*.cantidad'          => 'required|integer|min:1',
        ]);

        try {
            $pedido = DB::transaction(function () use ($validated) {
                $total = 0;
                $itemsParaCrear = [];

                foreach ($validated['items'] as $item) {
                    $producto = Producto::findOrFail($item['producto_id']);

                    if (!$producto->activo) {
                        throw new \Exception("El producto '{$producto->nombre}' no está disponible.");
                    }

                    $precioUnitario = $producto->precio;

                    // Gestión de variante
                    if (!empty($item['variante_id'])) {
                        $variante = VarianteProducto::findOrFail($item['variante_id']);
                        $precioUnitario += $variante->modificador_precio;

                        if ($variante->stock < $item['cantidad']) {
                            throw new \Exception("Stock insuficiente para la variante '{$variante->nombre}'.");
                        }

                        $variante->decrement('stock', $item['cantidad']);
                    } else {
                        if ($producto->stock < $item['cantidad']) {
                            throw new \Exception("Stock insuficiente para el producto '{$producto->nombre}'.");
                        }

                        $producto->decrement('stock', $item['cantidad']);
                    }

                    $total += $precioUnitario * $item['cantidad'];

                    $itemsParaCrear[] = [
                        'producto_id'    => $item['producto_id'],
                        'variante_id'    => $item['variante_id'] ?? null,
                        'cantidad'       => $item['cantidad'],
                        'precio_unitario' => $precioUnitario,
                    ];
                }

                $pedido = Pedido::create([
                    'usuario_id'      => $validated['usuario_id'],
                    'direccion_envio' => $validated['direccion_envio'],
                    'total'           => $total,
                    'estado'          => 'pendiente',
                ]);

                $pedido->items()->createMany($itemsParaCrear);

                return $pedido;
            });

            return response()->json($pedido->load(['items.producto', 'items.variante']), 201);

        } catch (\Exception $e) {
            return response()->json(['mensaje' => $e->getMessage()], 422);
        }
    }

    public function show(string $id): JsonResponse
    {
        $pedido = Pedido::with(['items.producto', 'items.variante', 'usuario'])
            ->findOrFail($id);

        return response()->json($pedido);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $pedido = Pedido::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,pagado,enviado,entregado,cancelado',
        ]);

        $transicionesValidas = [
            'pendiente'  => ['pagado', 'cancelado'],
            'pagado'     => ['enviado', 'cancelado'],
            'enviado'    => ['entregado'],
            'entregado'  => [],
            'cancelado'  => [],
        ];

        if (!in_array($validated['estado'], $transicionesValidas[$pedido->estado])) {
            return response()->json([
                'mensaje' => "No se puede cambiar el estado de '{$pedido->estado}' a '{$validated['estado']}'.",
            ], 422);
        }

        $pedido->update(['estado' => $validated['estado']]);

        return response()->json($pedido);
    }

    public function destroy(string $id): JsonResponse
    {
        $pedido = Pedido::findOrFail($id);

        if (!in_array($pedido->estado, ['pendiente', 'cancelado'])) {
            return response()->json([
                'mensaje' => 'Solo se pueden eliminar pedidos en estado pendiente o cancelado.',
            ], 409);
        }

        $pedido->items()->delete();
        $pedido->delete();

        return response()->json(['mensaje' => 'Pedido eliminado correctamente.']);
    }
}