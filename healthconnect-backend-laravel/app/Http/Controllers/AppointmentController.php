<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    // 🔹 Créer un RDV
    public function store(Request $request)
    {
        $user = Auth::user();

        $appointment = Appointment::create([
            'patient_id' => Auth::id(),
            'doctor_id' => $request->doctor_id,
            'date' => $request->date,
            'time' => $request->time,
            'reason' => $request->reason
        ]);

        return response()->json($appointment);
    }

    // 🔹 Voir tous les RDV (admin)
    public function index()
    {
        return Appointment::with(['patient', 'doctor'])->get();
    }

    // 🔥 🔹 RDV du patient connecté
    public function patientAppointments()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $appointments = Appointment::where('patient_id', $user->id)
            ->with('doctor')
            ->latest()
            ->get();

        return response()->json($appointments);
    }

    // 🔹 Changer statut
    public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->status = $request->status;
        $appointment->save();

        return response()->json($appointment);
    }
}
