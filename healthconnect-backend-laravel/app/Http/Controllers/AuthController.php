<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientProfile;
use App\Models\DoctorProfile;
use App\Services\Notifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            // Jamais "admin" via l'inscription publique
            'role' => 'nullable|in:patient,doctor',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'patient'
        ]);

        // Create profile based on role
        if ($user->role === 'patient') {
            PatientProfile::create(['user_id' => $user->id]);
        } else {
            DoctorProfile::create([
                'user_id' => $user->id,
                'specialty' => 'Non défini'
            ]);
        }

        Notifier::send(
            Notifier::admins(),
            'user_registered',
            $user->role === 'doctor' ? 'Nouveau médecin inscrit' : 'Nouveau patient inscrit',
            "{$user->name} ({$user->email}) vient de créer un compte.",
            '/admin/users'
        );

        // Create token for immediate login
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        // Créer un token personnel (sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }


}
