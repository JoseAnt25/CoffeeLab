<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VarianteProducto extends Model
{
    protected $table = 'variantes_producto';

    protected $fillable = [
        'producto_id',
        'nombre',
        'modificador_precio',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'modificador_precio' => 'decimal:2',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function itemsPedido(): HasMany
    {
        return $this->hasMany(ItemPedido::class, 'variante_id');
    }
}