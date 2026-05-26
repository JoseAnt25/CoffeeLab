<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para la tabla de items de pedido (líneas de pedido).
 *
 * Cada item representa un producto incluido en un pedido,
 * con su cantidad y el precio unitario en el momento de la compra.
 * Si el producto tenía variante seleccionada, se guarda la referencia.
 *
 * No tiene timestamps ya que los items no se modifican una vez creados.
 * El precio_unitario incluye ya el modificador de la variante si la hay.
 */
return new class extends Migration
{
    /**
     * Crea la tabla items_pedido.
     *
     * Campos:
     * - pedido_id: clave foránea hacia pedidos (cascade on delete)
     * - producto_id: clave foránea hacia productos (sin cascade para preservar historial)
     * - variante_id: clave foránea hacia variantes_producto, nullable
     *   Si la variante se elimina, se pone a null (nullOnDelete)
     * - cantidad: número de unidades del producto en este item
     * - precio_unitario: precio en el momento de la compra incluyendo modificador de variante
     *   Almacenado para preservar el historial aunque los precios cambien
     */
    public function up(): void
    {
        Schema::create('items_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('variante_id')->nullable()->constrained('variantes_producto')->nullOnDelete();
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 8, 2);
        });
    }

    /**
     * Elimina la tabla items_pedido.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_pedido');
    }
};