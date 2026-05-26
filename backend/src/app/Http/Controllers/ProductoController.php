<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Controlador de productos del catálogo.
 *
 * Gestiona el CRUD completo de productos incluyendo la subida de imágenes.
 * Los productos se paginan de 10 en 10 para el panel de administración.
 * Si un producto tiene pedidos asociados, se desactiva en lugar de eliminarse
 * para preservar el historial de pedidos.
 */
class ProductoController extends Controller
{
    /**
     * Lista los productos activos paginados con su categoría y variantes.
     *
     * Solo devuelve productos con activo=true.
     * Devuelve 10 productos por página.
     *
     * @param  Request  $request  Puede incluir el parámetro ?page=N
     * @return JsonResponse       Respuesta paginada con data, current_page, last_page, total
     */
    public function index(Request $request): JsonResponse
    {
        $productos = Producto::with(['categoria', 'variantes'])
            ->where('activo', true)
            ->paginate(10);

        return response()->json($productos);
    }

    /**
     * Crea un nuevo producto en el catálogo.
     *
     * Opcionalmente acepta una imagen y un array de variantes
     * que se crean junto al producto en la misma petición.
     *
     * @param  Request  $request  Datos del producto y variantes opcionales
     * @return JsonResponse       Producto creado con sus variantes (HTTP 201)
     */
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

        // Almacenar imagen si se ha enviado
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

        // Crear variantes si se han enviado
        if (!empty($validated['variantes'])) {
            $producto->variantes()->createMany($validated['variantes']);
        }

        return response()->json($producto->load('variantes'), 201);
    }

    /**
     * Muestra un producto con su categoría y variantes.
     *
     * @param  string  $id       ID del producto
     * @return JsonResponse      Producto completo, o 404 si no existe
     */
    public function show(string $id): JsonResponse
    {
        $producto = Producto::with(['categoria', 'variantes'])
            ->findOrFail($id);

        return response()->json($producto);
    }

    /**
     * Actualiza un producto existente.
     *
     * Solo actualiza los campos enviados (sometimes).
     * Si se envía una nueva imagen, elimina la anterior del storage.
     *
     * @param  Request  $request  Datos a actualizar
     * @param  string   $id       ID del producto
     * @return JsonResponse       Producto actualizado con categoría y variantes, o 404 si no existe
     */
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

        // Reemplazar imagen si se ha enviado una nueva
        if ($request->hasFile('imagen')) {
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($validated);

        return response()->json($producto->load(['categoria', 'variantes']));
    }

    /**
     * Elimina un producto del catálogo.
     *
     * Si el producto tiene pedidos asociados, se desactiva en lugar
     * de eliminarse para preservar el historial de pedidos.
     * Si se elimina, borra también su imagen del storage y sus variantes.
     *
     * @param  string  $id       ID del producto
     * @return JsonResponse      Mensaje de confirmación, o 404 si no existe
     */
    public function destroy(string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);

        // Desactivar en lugar de eliminar si tiene pedidos asociados
        if ($producto->itemsPedido()->count() > 0) {
            $producto->update(['activo' => false]);
            return response()->json([
                'mensaje' => 'El producto tiene pedidos asociados y ha sido desactivado.',
            ]);
        }

        // Eliminar imagen del storage si existe
        if ($producto->imagen) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->variantes()->delete();
        $producto->delete();

        return response()->json(['mensaje' => 'Producto eliminado correctamente.']);
    }

    /**
     * Sube o reemplaza la imagen de un producto.
     *
     * Endpoint dedicado exclusivamente a la gestión de imágenes.
     * Si el producto ya tenía imagen, la elimina del storage antes de guardar la nueva.
     *
     * @param  Request  $request  Debe incluir el campo 'imagen' como archivo
     * @param  string   $id       ID del producto
     * @return JsonResponse       Producto con la nueva imagen_url, o 404 si no existe
     */
    public function subirImagen(Request $request, string $id): JsonResponse
    {
        $producto = Producto::findOrFail($id);

        $request->validate([
            'imagen' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Eliminar imagen anterior si existe
        if ($producto->imagen) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->imagen = $request->file('imagen')->store('productos', 'public');
        $producto->save();

        return response()->json($producto);
    }
}