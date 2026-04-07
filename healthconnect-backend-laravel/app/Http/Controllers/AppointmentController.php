<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * 📌 Lister les rendez-vous (patient connecté)
     */
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
            ->latest()
            ->get();

        return response()->json($appointments);
    }


    public function doctorAppointments()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $appointments = Appointment::where('doctor_id', $user->id)
            ->with('patient')
            ->latest()
            ->get();

        $patient_count = $appointments->pluck('patient_id')->unique()->count();
        $consultations_count = $appointments->where('status', 'accepted')->count();
        $finished_consultations_count = $appointments->where('status', 'completed')->count();

        return response()->json([
            'appointments' => $appointments,
            'patientsCount' => $patient_count,
            'consultationsCount' => $consultations_count,
            'finishedConsultationsCount' => $finished_consultations_count
        ]);
    }


    /**
     * 📌 Créer un rendez-vous
     */
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'required',
            'reason' => 'nullable|string'
        ]);

        $time = date('H:i:s', strtotime($request->time));
        // 🔥 Vérifier si créneau déjà pris
        $exists = Appointment::where('doctor_id', $request->doctor_id)
            ->where('date', $request->date)
            ->where('time', $time)
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Créneau déjà réservé'
            ], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => Auth::id(),
            'doctor_id' => $request->doctor_id,
            'date' => $request->date,
            'time' => $time,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Rendez-vous créé',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * 📌 Voir un rendez-vous
     */
    public function show($id)
    {
        $appointment = Appointment::with(['doctor', 'patient'])->findOrFail($id);

        return response()->json($appointment);
    }

    /**
     * 📌 Annuler un rendez-vous
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);

        // sécurité : seul le patient peut supprimer
        if ($appointment->patient_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $appointment->delete();

        return response()->json(['message' => 'Rendez-vous supprimé']);
    }

    /**
     * 📌 Changer statut (doctor/admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,completed'
        ]);

        $appointment = Appointment::findOrFail($id);

        $appointment->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'appointment' => $appointment
        ]);
    }

    /**
     * 📌 Récupérer créneaux déjà réservés (IMPORTANT FRONT)
     */
    public function bookedSlots($doctor_id, $date)
    {



        $appointments = Appointment::where('doctor_id', $doctor_id)
            ->where('date', $date)
            ->whereIn('status', ['pending', 'accepted'])
            ->pluck('time');

        return response()->json($appointments);
    }
}
