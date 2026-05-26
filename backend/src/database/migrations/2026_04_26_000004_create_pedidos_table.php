<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para la tabla de pedidos.
 *
 * Cada pedido pertenece a un usuario y contiene uno o más items.
 * El total se calcula y almacena en el momento de la compra para
 * preservar el historial aunque los precios cambien posteriormente.
 *
 * Flujo de estados válidos:
 * pendiente → pagado → enviado → entregado
 * pendiente/pagado → cancelado
 */
return new class extends Migration
{
    /**
     * Crea la tabla pedidos.
     *
     * Campos:
     * - usuario_id: clave foránea hacia usuarios (cascade on delete)
     * - total: importe total calculado en el momento de la compra (precisión 10,2)
     * - estado: enum con el estado actual del pedido, por defecto 'pendiente'
     * - direccion_envio: dirección de entrega registrada en el momento del pedido
     */
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->decimal('total', 10, 2);
            $table->enum('estado', ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'])->default('pendiente');
            $table->string('direccion_envio');
            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla pedidos.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};