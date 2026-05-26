<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración principal de usuarios y tablas auxiliares de autenticación.
 *
 * Crea tres tablas:
 * - usuarios: tabla principal de usuarios de la aplicación
 * - password_reset_tokens: tokens para recuperación de contraseña
 * - sessions: sesiones de usuario para el driver de sesiones de base de datos
 */
return new class extends Migration
{
    /**
     * Crea las tablas de usuarios, tokens de reseteo y sesiones.
     *
     * La tabla usuarios incluye:
     * - nombre: nombre completo del usuario
     * - correo: email único para autenticación
     * - contrasena: contraseña hasheada
     * - direccion: dirección de envío opcional
     * - rol: enum con valores 'admin' o 'cliente' (por defecto 'cliente')
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('correo')->unique();
            $table->string('contrasena');
            $table->string('direccion')->nullable();
            $table->enum('rol', ['admin', 'cliente'])->default('cliente');
            $table->timestamps();
        });

        // Tabla para tokens de recuperación de contraseña
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla para gestión de sesiones de base de datos
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Elimina las tablas creadas en el método up().
     * Se ejecuta en orden inverso para respetar las dependencias.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};