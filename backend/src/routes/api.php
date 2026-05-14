<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show']);
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{categoria}', [CategoriaController::class, 'show']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/productos/{producto}/imagen', [ProductoController::class, 'update']);
Route::put('/me', [AuthController::class, 'update']);
Route::get('/me', [AuthController::class, 'me']);

// Categorías — solo escritura
Route::post('/categorias', [CategoriaController::class, 'store']);
Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy']);

// Productos — solo escritura
Route::post('/productos', [ProductoController::class, 'store']);
Route::put('/productos/{producto}', [ProductoController::class, 'update']);
Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

// Pedidos — todo protegido
Route::apiResource('pedidos', PedidoController::class);
});