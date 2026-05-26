<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de variantes de producto.
 *
 * Gestiona la creación, actualización y eliminación de variantes
 * asociadas a un producto (ej: diferentes tamaños de café o capacidades
 * de cafetera). Cada variante tiene su propio stock y modificador de precio
 * que se suma al precio base del producto.
 */
class VarianteProductoController extends Controller
{
    /**
     * Crea una nueva variante para un producto existente.
     *
     * @param  Request  $request     Datos: nombre, modificador_precio, stock
     * @param  string   $productoId  ID del producto al que pertenece la variante
     * @return JsonResponse          Variante creada (HTTP 201), o 404 si el producto no existe
     */
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

    /**
     * Actualiza una variante existente.
     *
     * Solo actualiza los campos enviados en la petición (sometimes).
     *
     * @param  Request  $request  Datos a actualizar: nombre, modificador_precio, stock (todos opcionales)
     * @param  string   $id       ID de la variante
     * @return JsonResponse       Variante actualizada, o 404 si no existe
     */
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

    /**
     * Elimina una variante de producto.
     *
     * @param  string  $id       ID de la variante
     * @return JsonResponse      Mensaje de confirmación, o 404 si no existe
     */
    public function destroy(string $id): JsonResponse
    {
        $variante = VarianteProducto::findOrFail($id);
        $variante->delete();

        return response()->json(['mensaje' => 'Variante eliminada correctamente.']);
    }
}