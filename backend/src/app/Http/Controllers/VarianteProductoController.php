<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VarianteProductoController extends Controller
{
    public function store(Request $request, string $productoId): JsonResponse
    {
        $producto = Producto::findOrFail($productoId);

        $validated = $request->validate([
            'nombre'             => 'required|string|max:255',
            'modificador_precio' => 'required|numeric',
            'stock'              => 'required|integer|min:0',
        ]);

        $variante = $producto->variantes()->create($validated);

        return response()->json($variante, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $variante = VarianteProducto::findOrFail($id);

        $validated = $request->validate([
            'nombre'             => 'sometimes|string|max:255',
            'modificador_precio' => 'sometimes|numeric',
            'stock'              => 'sometimes|integer|min:0',
        ]);

        $variante->update($validated);

        return response()->json($variante);
    }

    public function destroy(string $id): JsonResponse
    {
        $variante = VarianteProducto::findOrFail($id);
        $variante->delete();

        return response()->json(['mensaje' => 'Variante eliminada correctamente.']);
    }
}