<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Controlador de categorías de productos.
 *
 * Gestiona el CRUD completo de categorías. El slug se genera
 * automáticamente a partir del nombre para su uso en URLs amigables.
 * No se permite eliminar categorías que tengan productos asociados.
 */
class CategoriaController extends Controller
{
    /**
     * Lista todas las categorías con el conteo de productos de cada una.
     *
     * @return JsonResponse  Array de categorías con el campo productos_count
     */
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('productos')->get();

        return response()->json($categorias);
    }

    /**
     * Crea una nueva categoría.
     *
     * El slug se genera automáticamente a partir del nombre
     * usando el helper Str::slug de Laravel.
     *
     * @param  Request  $request  Datos: nombre (único)
     * @return JsonResponse       Categoría creada (HTTP 201)
     */
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

    /**
     * Muestra una categoría con sus productos y conteo.
     *
     * @param  string  $id       ID de la categoría
     * @return JsonResponse      Categoría con productos y productos_count, o 404 si no existe
     */
    public function show(string $id): JsonResponse
    {
        $categoria = Categoria::withCount('productos')
            ->with('productos')
            ->findOrFail($id);

        return response()->json($categoria);
    }

    /**
     * Actualiza una categoría existente.
     *
     * Si se actualiza el nombre, regenera el slug automáticamente.
     * La validación de unicidad excluye la propia categoría.
     *
     * @param  Request  $request  Datos a actualizar: nombre (opcional)
     * @param  string   $id       ID de la categoría
     * @return JsonResponse       Categoría actualizada, o 404 si no existe
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255|unique:categorias,nombre,' . $id,
        ]);

        // Regenerar el slug si se actualiza el nombre
        if (isset($validated['nombre'])) {
            $validated['slug'] = Str::slug($validated['nombre']);
        }

        $categoria->update($validated);

        return response()->json($categoria);
    }

    /**
     * Elimina una categoría.
     *
     * No se permite eliminar categorías con productos asociados
     * para mantener la integridad referencial. Devuelve 409 en ese caso.
     *
     * @param  string  $id       ID de la categoría
     * @return JsonResponse      Mensaje de confirmación, 409 si tiene productos, o 404 si no existe
     */
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