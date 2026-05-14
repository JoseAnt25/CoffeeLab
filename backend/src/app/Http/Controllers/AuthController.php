<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'    => 'required|string|max:255',
            'correo'    => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|confirmed',
            'direccion' => 'nullable|string|max:255',
        ]);

        $usuario = User::create([
            'nombre'     => $validated['nombre'],
            'correo'     => $validated['correo'],
            'contrasena' => Hash::make($validated['contrasena']),
            'direccion'  => $validated['direccion'] ?? null,
            'rol'        => 'cliente',
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'correo'     => 'required|email',
            'contrasena' => 'required|string',
        ]);

        $usuario = User::where('correo', $validated['correo'])->first();

        if (!$usuario || !Hash::check($validated['contrasena'], $usuario->contrasena)) {
            return response()->json([
                'mensaje' => 'Credenciales incorrectas.',
            ], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensaje' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('pedidos'));
    }

    public function update(Request $request): JsonResponse
    {
    $usuario = $request->user();

    $validated = $request->validate([
        'nombre'    => 'sometimes|string|max:255',
        'direccion' => 'sometimes|string|max:255',
    ]);

    $usuario->update($validated);

    // Actualizar localStorage con los nuevos datos
    return response()->json($usuario);
    }
}