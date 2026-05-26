<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para la tabla de categorías de productos.
 *
 * Las categorías agrupan los productos del catálogo
 * (ej: 'Café en grano', 'Cafeteras', 'Accesorios').
 * El slug se genera automáticamente desde el controlador
 * a partir del nombre para su uso en URLs amigables.
 */
return new class extends Migration
{
    /**
     * Crea la tabla categorias.
     *
     * Campos:
     * - nombre: nombre de la categoría
     * - slug: versión URL-friendly del nombre, único (ej: 'cafe-en-grano')
     */
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla categorias.
     */
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};