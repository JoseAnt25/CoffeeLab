<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador de pedidos.
 *
 * Gestiona el ciclo de vida completo de los pedidos:
 * creación con validación de stock, consulta filtrada por rol,
 * actualización de estado con validación de transiciones y eliminación.
 *
 * Los admins ven todos los pedidos paginados.
 * Los clientes solo ven sus propios pedidos.
 *
 * La creación de pedidos se realiza dentro de una transacción de base
 * de datos para garantizar la consistencia del stock y el total.
 */
class PedidoController extends Controller
{
    /**
     * Lista los pedidos según el rol del usuario autenticado.
     *
     * Los administradores reciben todos los pedidos con datos del usuario.
     * Los clientes solo reciben sus propios pedidos.
     * Ambos casos devuelven 10 pedidos por página.
     *
     * @param  Request  $request  Petición autenticada, puede incluir ?page=N
     * @return JsonResponse       Respuesta paginada con pedidos e items
     */
    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->rol === 'admin') {
            $pedidos = Pedido::with(['items.producto', 'items.variante', 'usuario'])
                ->paginate(10);
        } else {
            $pedidos = Pedido::with(['items.producto', 'items.variante'])
                ->where('usuario_id', $usuario->id)
                ->paginate(10);
        }

        return response()->json($pedidos);
    }

    /**
     * Crea un nuevo pedido con validación de stock en tiempo real.
     *
     * Ejecuta todo el proceso dentro de una transacción de base de datos:
     * - Verifica que cada producto esté activo
     * - Comprueba stock suficiente (por variante o por producto)
     * - Descuenta el stock de los productos/variantes
     * - Calcula el total sumando precio base + modificador de variante
     * - Crea el pedido y sus items
     *
     * Si cualquier paso falla, la transacción se revierte completamente.
     *
     * @param  Request  $request  Datos: usuario_id, direccion_envio, items[]
     * @return JsonResponse       Pedido creado con items (HTTP 201), o error 422
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'usuario_id'          => 'required|exists:usuarios,id',
            'direccion_envio'     => 'required|string|max:255',
            'items'               => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.variante_id' => 'nullable|exists:variantes_producto,id',
            'items.*.cantidad'    => 'required|integer|min:1',
        ]);

        try {
            $pedido = DB::transaction(function () use ($validated) {
                $total = 0;
                $itemsParaCrear = [];

                foreach ($validated['items'] as $item) {
                    $producto = Producto::findOrFail($item['producto_id']);

                    // Verificar que el producto está disponible
                    if (!$producto->activo) {
                        throw new \Exception("El producto '{$producto->nombre}' no está disponible.");
                    }

                    $precioUnitario = $producto->precio;

                    // Gestión de stock por variante o por producto
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
                        'producto_id'     => $item['producto_id'],
                        'variante_id'     => $item['variante_id'] ?? null,
                        'cantidad'        => $item['cantidad'],
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

    /**
     * Muestra un pedido con sus items y datos del usuario.
     *
     * @param  string  $id       ID del pedido
     * @return JsonResponse      Pedido completo, o 404 si no existe
     */
    public function show(string $id): JsonResponse
    {
        $pedido = Pedido::with(['items.producto', 'items.variante', 'usuario'])
            ->findOrFail($id);

        return response()->json($pedido);
    }

    /**
     * Actualiza el estado de un pedido.
     *
     * Valida que la transición de estado sea válida según el flujo:
     * pendiente → pagado → enviado → entregado
     * pendiente/pagado → cancelado
     *
     * No se permiten retrocesos ni transiciones no definidas.
     *
     * @param  Request  $request  Datos: estado (nuevo estado)
     * @param  string   $id       ID del pedido
     * @return JsonResponse       Pedido actualizado, 422 si la transición no es válida, o 404
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $pedido = Pedido::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,pagado,enviado,entregado,cancelado',
        ]);

        // Mapa de transiciones válidas por estado actual
        $transicionesValidas = [
            'pendiente' => ['pagado', 'cancelado'],
            'pagado'    => ['enviado', 'cancelado'],
            'enviado'   => ['entregado'],
            'entregado' => [],
            'cancelado' => [],
        ];

        if (!in_array($validated['estado'], $transicionesValidas[$pedido->estado])) {
            return response()->json([
                'mensaje' => "No se puede cambiar el estado de '{$pedido->estado}' a '{$validated['estado']}'.",
            ], 422);
        }

        $pedido->update(['estado' => $validated['estado']]);

        return response()->json($pedido);
    }

    /**
     * Elimina un pedido y sus items.
     *
     * Solo se permite eliminar pedidos en estado 'pendiente' o 'cancelado'.
     * Los pedidos en proceso (pagado, enviado, entregado) no pueden eliminarse.
     *
     * @param  string  $id       ID del pedido
     * @return JsonResponse      Mensaje de confirmación, 409 si no se puede eliminar, o 404
     */
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