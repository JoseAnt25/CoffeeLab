<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
    public function down(): void {
    Schema::dropIfExists('items_pedido');
    }
};