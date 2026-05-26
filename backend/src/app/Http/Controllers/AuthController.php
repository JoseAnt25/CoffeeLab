<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador de autenticación.
 *
 * Gestiona el registro, inicio de sesión, cierre de sesión
 * y actualización de datos del usuario autenticado.
 * Utiliza Laravel Sanctum para la generación y gestión de tokens de API.
 */
class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario en la aplicación.
     *
     * Crea el usuario con rol 'cliente' por defecto y devuelve
     * un token de acceso para que pueda autenticarse inmediatamente.
     *
     * @param  Request  $request  Datos del formulario: nombre, correo, contrasena, direccion (opcional)
     * @return JsonResponse       Usuario creado y token de acceso (HTTP 201)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255',
            'correo'     => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|confirmed',
            'direccion'  => 'nullable|string|max:255',
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

    /**
     * Autentica un usuario existente.
     *
     * Verifica las credenciales contra la base de datos y,
     * si son correctas, genera y devuelve un nuevo token de acceso.
     *
     * @param  Request  $request  Credenciales: correo y contrasena
     * @return JsonResponse       Usuario autenticado y token, o error 401 si las credenciales son incorrectas
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'correo'     => 'required|email',
            'contrasena' => 'required|string',
        ]);

        $usuario = User::where('correo', $validated['correo'])->first();

        // Verificar que el usuario existe y la contraseña es correcta
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

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * Elimina el token de acceso actual del usuario,
     * invalidando futuras peticiones con ese token.
     *
     * @param  Request  $request  Petición con el token de acceso en la cabecera Authorization
     * @return JsonResponse       Mensaje de confirmación
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensaje' => 'Sesión cerrada correctamente.']);
    }

    /**
     * Devuelve los datos del usuario autenticado.
     *
     * Incluye los pedidos del usuario para mostrar
     * el historial en la página de Mi Cuenta.
     *
     * @param  Request  $request  Petición autenticada
     * @return JsonResponse       Datos del usuario con sus pedidos
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('pedidos'));
    }

    /**
     * Actualiza los datos del usuario autenticado.
     *
     * Permite modificar el nombre y/o la dirección de envío.
     * Solo actualiza los campos enviados en la petición (sometimes).
     *
     * @param  Request  $request  Datos a actualizar: nombre (opcional), direccion (opcional)
     * @return JsonResponse       Usuario con los datos actualizados
     */
    public function update(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $validated = $request->validate([
            'nombre'    => 'sometimes|string|max:255',
            'direccion' => 'sometimes|string|max:255',
        ]);

        $usuario->update($validated);

        return response()->json($usuario);
    }
}