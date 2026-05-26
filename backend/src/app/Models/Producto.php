<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Modelo de producto de la tienda.
 *
 * Representa un producto del catálogo (café en grano, cafetera, accesorio, etc.).
 * Puede tener variantes con modificadores de precio (ej: diferentes tamaños)
 * e imagen almacenada en el storage público de Laravel.
 *
 * @property int         $id
 * @property int         $categoria_id
 * @property string      $nombre
 * @property string|null $descripcion
 * @property string|null $imagen       Ruta relativa al storage (ej: 'productos/abc.jpg')
 * @property string|null $imagen_url   URL absoluta generada automáticamente (appended)
 * @property float       $precio       Precio base del producto
 * @property int         $stock        Unidades disponibles
 * @property bool        $activo       Si false, el producto no aparece en el catálogo
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Producto extends Model
{
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'productos';

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'imagen',
        'precio',
        'stock',
        'activo',
    ];

    /**
     * Atributos calculados que se añaden automáticamente a la serialización.
     * imagen_url se genera a partir del campo imagen.
     *
     * @var array<string>
     */
    protected $appends = ['imagen_url'];

    /**
     * Casting de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * Accessor para generar la URL absoluta de la imagen del producto.
     * Combina APP_URL con la ruta del storage para construir la URL completa.
     * Devuelve null si el producto no tiene imagen asignada.
     *
     * @return string|null
     */
    public function getImagenUrlAttribute(): string|null
    {
        if (!$this->imagen) return null;
        return config('app.url') . '/storage/' . $this->imagen;
    }

    /**
     * Relación con la categoría del producto.
     * Un producto pertenece a una única categoría.
     *
     * @return BelongsTo<Categoria, Producto>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    /**
     * Relación con las variantes del producto.
     * Un producto puede tener múltiples variantes (ej: 250g, 500g, 1kg).
     *
     * @return HasMany<VarianteProducto>
     */
    public function variantes(): HasMany
    {
        return $this->hasMany(VarianteProducto::class, 'producto_id');
    }

    /**
     * Relación con los items de pedido que incluyen este producto.
     * Se usa para evitar borrar productos con pedidos asociados.
     *
     * @return HasMany<ItemPedido>
     */
    public function itemsPedido(): HasMany
    {
        return $this->hasMany(ItemPedido::class, 'producto_id');
    }
}