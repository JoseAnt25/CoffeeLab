<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('productos')->get();

        return response()->json($categorias);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias,nombre',
        ]);

        $categoria = Categoria::create([
            'nombre' => $validated['nombre'],
            'slug'   => Str::slug($validated['nombre']),
        ]);

        return response()->json($categoria, 201);
    }

    public function show(string $id): JsonResponse
    {
        $categoria = Categoria::withCount('productos')
            ->with('productos')
            ->findOrFail($id);

        return response()->json($categoria);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255|unique:categorias,nombre,' . $id,
        ]);

        if (isset($validated['nombre'])) {
            $validated['slug'] = Str::slug($validated['nombre']);
        }

        $categoria->update($validated);

        return response()->json($categoria);
    }

    public function destroy(string $id): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);

        if ($categoria->productos()->count() > 0) {
            return response()->json([
                'mensaje' => 'No se puede eliminar una categoría con productos asociados.',
            ], 409);
        }

        $categoria->delete();

        return response()->json(['mensaje' => 'Categoría eliminada correctamente.']);
    }
}