<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para añadir el campo imagen a la tabla productos.
 *
 * Añade soporte para imágenes de producto almacenadas en el
 * storage público de Laravel. El campo guarda la ruta relativa
 * al archivo (ej: 'productos/abc123.jpg') y la URL completa
 * se genera dinámicamente mediante el accessor imagen_url del modelo.
 *
 * El campo es nullable para mantener compatibilidad con los
 * productos existentes que no tienen imagen asignada.
 */
return new class extends Migration
{
    /**
     * Añade el campo imagen a la tabla productos.
     *
     * Se inserta después del campo descripcion para mantener
     * un orden lógico en la estructura de la tabla.
     */
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('imagen')->nullable()->after('descripcion');
        });
    }

    /**
     * Elimina el campo imagen de la tabla productos.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('imagen');
        });
    }
};