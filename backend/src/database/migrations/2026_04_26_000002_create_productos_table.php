<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para la tabla de productos del catálogo.
 *
 * Cada producto pertenece a una categoría y puede tener
 * múltiples variantes con modificadores de precio.
 * El campo activo permite desactivar productos sin eliminarlos,
 * preservando el historial de pedidos asociados.
 */
return new class extends Migration
{
    /**
     * Crea la tabla productos.
     *
     * Campos:
     * - categoria_id: clave foránea hacia categorias (cascade on delete)
     * - nombre: nombre del producto
     * - descripcion: descripción detallada (opcional)
     * - precio: precio base con 2 decimales (el precio final puede variar según variante)
     * - stock: unidades disponibles (se gestiona por variante si el producto tiene variantes)
     * - activo: si false el producto no aparece en el catálogo público
     */
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 8, 2);
            $table->integer('stock')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla productos.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};