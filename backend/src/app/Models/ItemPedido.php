<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo de línea de pedido (item de pedido).
 *
 * Representa cada producto incluido en un pedido, almacenando
 * el precio unitario en el momento de la compra para preservar
 * el historial aunque los precios cambien posteriormente.
 * Si el producto tenía variante seleccionada, se guarda la referencia.
 *
 * No tiene timestamps ya que es una tabla de relación con datos fijos
 * que no se modifican una vez creados.
 *
 * @property int        $id
 * @property int        $pedido_id
 * @property int        $producto_id
 * @property int|null   $variante_id     Null si el producto no tiene variante seleccionada
 * @property int        $cantidad        Número de unidades del producto
 * @property float      $precio_unitario Precio en el momento de la compra (incluye modificador de variante)
 */
class ItemPedido extends Model
{
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'items_pedido';

    /**
     * Desactiva los timestamps ya que los items de pedido
     * no se modifican una vez creados.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'pedido_id',
        'producto_id',
        'variante_id',
        'cantidad',
        'precio_unitario',
    ];

    /**
     * Casting de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio_unitario' => 'decimal:2',
        ];
    }

    /**
     * Relación con el pedido al que pertenece este item.
     *
     * @return BelongsTo<Pedido, ItemPedido>
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    /**
     * Relación con el producto de este item.
     *
     * @return BelongsTo<Producto, ItemPedido>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    /**
     * Relación con la variante seleccionada para este item.
     * Puede ser null si el producto no tiene variantes.
     *
     * @return BelongsTo<VarianteProducto, ItemPedido>
     */
    public function variante(): BelongsTo
    {
        return $this->belongsTo(VarianteProducto::class, 'variante_id');
    }
}