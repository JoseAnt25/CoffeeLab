<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de categoría de productos.
 *
 * Agrupa los productos de la tienda en categorías como
 * 'Café en grano', 'Cafeteras' o 'Accesorios'.
 *
 * @property int    $id
 * @property string $nombre
 * @property string $slug    Versión URL-friendly del nombre (ej: 'cafe-en-grano')
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Categoria extends Model
{
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'categorias';

    /**
     * Atributos que se pueden asignar masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'nombre',
        'slug',
    ];

    /**
     * Relación con los productos de esta categoría.
     * Una categoría puede tener múltiples productos.
     *
     * @return HasMany<Producto>
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
}