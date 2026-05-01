<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nombre', 'correo', 'contrasena', 'direccion', 'rol'])]
#[Hidden(['contrasena'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $rememberTokenName = null;

    protected function casts(): array
    {
        return [
            'contrasena' => 'hashed',
        ];
    }

    public function pedidos(): HasMany {
    return $this->hasMany(Pedido::class, 'usuario_id');
    }

}