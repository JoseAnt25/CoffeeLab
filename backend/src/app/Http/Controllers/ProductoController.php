<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $productos = Producto::with(['categoria', 'variantes'])
            ->where('activo', true)
            ->paginate(10);

        return response()->json($productos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'categoria_id'                   => 'required|exists:categorias,id',
            'nombre'                         => 'required|string|max:255',
            'descripcion'                    => 'nullable|string',
            'imagen'                         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'precio'                         => 'required|numeric|min:0',
            'stock'                          => 'required|integer|min:0',
            'activo'                         => 'boolean',
            'variantes'                      => 'nullable|array',
            'variantes.*.nombre'             => 'required|string|max:255',
            'variantes.*.modificador_precio' => 'required|numeric',
            'variantes.*.stock'              => 'required|integer|min:0',
        ]);

        $imagenPath = null;
        if ($request->hasFile('imagen')) {
            $imagenPath = $request->file('imagen')->store('productos', 'public');
        }

        $producto = Producto::create([
            'categoria_id' => $validated['categoria_id'],
            'nombre'       => $validated['nombre'],
            'descripcion'  => $validated['descripcion'] ?? null,
            'imagen'       => $imagenPath,
            'precio'       => $validated['precio'],
            'stock'        => $validated['stock'],
            'activo'       => $validated['activo'] ?? true,
        ]);

        if (!empty($validated['variantes'])) {
            $producto->variantes()->createMany($validated['variantes']);
        }

        return response()->json($producto->load('variantes'), 201);
    }

    public function show(string $id): JsonResponse
    {
        $producto = Producto::with(['categoria', 'variantes'])
            ->findOrFail($id);

        return response()->json($producto);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);

        $validated = $request->validate([
            'categoria_id' => 'sometimes|exists:categorias,id',
            'nombre'       => 'sometimes|string|max:255',
            'descripcion'  => 'nullable|string',
            'imagen'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'precio'       => 'sometimes|numeric|min:0',
            'stock'        => 'sometimes|integer|min:0',
            'activo'       => 'sometimes|boolean',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($validated);

        return response()->json($producto->load(['categoria', 'variantes']));
    }

    public function destroy(string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);

        if ($producto->itemsPedido()->count() > 0) {
            $producto->update(['activo' => false]);
            return response()->json([
                'mensaje' => 'El producto tiene pedidos asociados y ha sido desactivado.',
            ]);
        }

        if ($producto->imagen) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->variantes()->delete();
        $producto->delete();

        return response()->json(['mensaje' => 'Producto eliminado correctamente.']);
    }

    public function subirImagen(Request $request, string $id): JsonResponse{
        $producto = Producto::findOrFail($id);

        $request->validate([
            'imagen' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($producto->imagen) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->imagen = $request->file('imagen')->store('productos', 'public');
        $producto->save();

        return response()->json($producto);
    }
}