<?php


namespace App\Http\Controllers;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // 🔹 Afficher le profil de l'utilisateur connecté
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $profile = $user->patientProfile;
        } elseif ($user->role === 'doctor') {
            $profile = $user->doctorProfile;
        } else {
            return response()->json(['message' => 'Rôle non reconnu'], 400);
        }

        return response()->json([
            'user' => $user,
            'profile' => $profile
        ]);
    }


    public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->id != $id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $data = $request->only(['name', 'email', 'avatar']);

        // Mise à jour de l'utilisateur
        $user->update($data);

        // Mise à jour du profil en fonction du rôle
        if ($user->role === 'patient') {
            $profileData = $request->only(['birth_date', 'phone']);
            $user->patientProfile->update($profileData);
        } elseif ($user->role === 'doctor') {
            $profileData = $request->only(['specialty', 'license_number']);
            $user->doctorProfile->update($profileData);
        }

        return response()->json([
            'user' => $user,
            'profile' => $user->profile
        ]);
    }

}
