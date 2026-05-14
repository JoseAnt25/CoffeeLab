<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'imagen',
        'precio',
        'stock',
        'activo',
    ];

    protected $appends = ['imagen_url'];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    public function getImagenUrlAttribute(): string|null
    {
        if (!$this->imagen) return null;
        return config('app.url') . '/storage/' . $this->imagen;
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function variantes(): HasMany
    {
        return $this->hasMany(VarianteProducto::class, 'producto_id');
    }

    public function itemsPedido(): HasMany
    {
        return $this->hasMany(ItemPedido::class, 'producto_id');
    }
}