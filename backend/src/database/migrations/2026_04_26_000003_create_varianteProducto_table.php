<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
    public function down(): void {
    Schema::dropIfExists('variantes_producto');
    }
};