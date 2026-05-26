<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo de usuario de la aplicación.
 *
 * Representa tanto a clientes como a administradores de la tienda.
 * Extiende Authenticatable para integrarse con el sistema de autenticación
 * de Laravel y utiliza Sanctum para la gestión de tokens de API.
 *
 * @property int         $id
 * @property string      $nombre
 * @property string      $correo
 * @property string      $contrasena
 * @property string|null $direccion
 * @property string      $rol         Valores posibles: 'admin', 'cliente'
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
#[Fillable(['nombre', 'correo', 'contrasena', 'direccion', 'rol'])]
#[Hidden(['contrasena'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'usuarios';

    /**
     * Desactiva el campo remember_token ya que no se utiliza
     * en esta implementación de autenticación basada en tokens.
     *
     * @var string|null
     */
    protected $rememberTokenName = null;

    /**
     * Casting de atributos.
     * La contraseña se hashea automáticamente al asignarse.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'contrasena' => 'hashed',
        ];
    }

    /**
     * Relación con los pedidos del usuario.
     * Un usuario puede tener múltiples pedidos.
     *
     * @return HasMany<Pedido>
     */
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class, 'usuario_id');
    }
}