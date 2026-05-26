<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para la tabla de variantes de producto.
 *
 * Las variantes permiten ofrecer un mismo producto en diferentes
 * presentaciones (ej: café en 250g, 500g o 1kg) con precios y
 * stocks independientes. El precio final de una variante se calcula
 * sumando el precio base del producto más el modificador_precio.
 */
return new class extends Migration
{
    /**
     * Crea la tabla variantes_producto.
     *
     * Campos:
     * - producto_id: clave foránea hacia productos (cascade on delete)
     * - nombre: nombre de la variante (ej: '250g', '6 tazas')
     * - modificador_precio: cantidad que se suma al precio base del producto.
     *   Puede ser 0 para la variante más básica o positivo para las superiores
     * - stock: unidades disponibles de esta variante específica
     */
    public function up(): void
    {
        Schema::create('variantes_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('nombre');
            $table->decimal('modificador_precio', 8, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla variantes_producto.
     */
    public function down(): void
    {
        Schema::dropIfExists('variantes_producto');
    }
};