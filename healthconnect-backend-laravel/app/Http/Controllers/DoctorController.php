<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    public function index()
    {
        return DoctorProfile::with('user')->get();
    }

    public function show($id)
    {
        return DoctorProfile::with('user')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $doctor = DoctorProfile::findOrFail($id);
        $doctor->update($request->all());

        return response()->json($doctor);
    }


    public function getAvailability(Request $request)
{
    $doctor = $request->user()->doctor;

    if (!$doctor) {
        return response()->json(['message' => 'Médecin non trouvé'], 404);
    }

    return response()->json([
        'available_time' => $doctor->available_time ?? []
    ]);
}

public function updateAvailability(Request $request)
{
    $request->validate([
        'available_time' => 'required|array',
    ]);

    $doctor = $request->user()->doctor;

    if (!$doctor) {
        return response()->json(['message' => 'Médecin non trouvé'], 404);
    }

    $doctor->available_time = $request->available_time;
    $doctor->save();

    return response()->json([
        'message' => 'Disponibilité mise à jour',
        'available_time' => $doctor->available_time
    ]);
}
}
