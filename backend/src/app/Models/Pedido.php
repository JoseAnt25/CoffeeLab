<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de pedido.
 *
 * Representa un pedido realizado por un usuario en la tienda.
 * Gestiona el ciclo de vida completo del pedido mediante estados
 * y mantiene el total calculado en el momento de la compra para
 * preservar el historial aunque los precios cambien posteriormente.
 *
 * Flujo de estados: pendiente → pagado → enviado → entregado / cancelado
 *
 * @property int    $id
 * @property int    $usuario_id
 * @property float  $total           Total calculado en el momento de la compra
 * @property string $estado          Valores: 'pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'
 * @property string $direccion_envio Dirección de entrega del pedido
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Pedido extends Model
{
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'pedidos';

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'usuario_id',
        'total',
        'estado',
        'direccion_envio',
    ];

    /**
     * Casting de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
        ];
    }

    /**
     * Relación con el usuario que realizó el pedido.
     * Un pedido pertenece a un único usuario.
     *
     * @return BelongsTo<User, Pedido>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relación con los items que componen el pedido.
     * Un pedido puede contener múltiples items (líneas de pedido).
     *
     * @return HasMany<ItemPedido>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ItemPedido::class, 'pedido_id');
    }
}