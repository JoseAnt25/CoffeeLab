<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de variante de producto.
 *
 * Representa una variante específica de un producto, como diferentes
 * tamaños de café (250g, 500g, 1kg) o capacidades de cafetera (3, 6, 9 tazas).
 * Cada variante tiene un modificador de precio que se suma al precio base
 * del producto y su propio control de stock independiente.
 *
 * @property int    $id
 * @property int    $producto_id
 * @property string $nombre              Nombre de la variante (ej: '500g', '6 tazas')
 * @property float  $modificador_precio  Cantidad que se suma al precio base del producto
 * @property int    $stock               Unidades disponibles de esta variante
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class VarianteProducto extends Model
{
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'variantes_producto';

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'producto_id',
        'nombre',
        'modificador_precio',
        'stock',
    ];

    /**
     * Casting de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'modificador_precio' => 'decimal:2',
        ];
    }

    /**
     * Relación con el producto al que pertenece esta variante.
     * Una variante pertenece a un único producto.
     *
     * @return BelongsTo<Producto, VarianteProducto>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    /**
     * Relación con los items de pedido que usan esta variante.
     * Se usa para controlar el stock y evitar borrados incorrectos.
     *
     * @return HasMany<ItemPedido>
     */
    public function itemsPedido(): HasMany
    {
        return $this->hasMany(ItemPedido::class, 'variante_id');
    }
}