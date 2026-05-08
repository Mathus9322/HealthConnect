<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * GET /appointments  (patient connecté)
     */
    public function patientAppointments()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'patient') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $appointments = Appointment::where('patient_id', $user->id)
            ->with(['doctor.doctorProfile'])   // ← chargement du profil médecin
            ->latest()
            ->get()
            ->map(function ($appt) {
                return [
                    'id'               => $appt->id,
                    'date'             => $appt->date,
                    'time'             => $appt->time,
                    'reason'           => $appt->reason,
                    'status'           => $appt->status,
                    'doctor'           => $appt->doctor ? [
                        'id'        => $appt->doctor->id,
                        'name'      => $appt->doctor->name,
                        'email'     => $appt->doctor->email,
                        'avatar'    => $appt->doctor->avatar,
                        'specialty' => $appt->doctor->doctorProfile?->specialty,
                        'experience'=> $appt->doctor->doctorProfile?->experience,
                    ] : null,
                ];
            });

        return response()->json($appointments);
    }

    /**
     * GET /doctor/appointments  (médecin connecté)
     */
    public function doctorAppointments()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $appointments = Appointment::where('doctor_id', $user->id)
            ->with(['patient.patientProfile'])
            ->latest()
            ->get();

        return response()->json([
            'appointments'              => $appointments,
            'patientsCount'             => $appointments->pluck('patient_id')->unique()->count(),
            'consultationsCount'        => $appointments->where('status', 'accepted')->count(),
            'finishedConsultationsCount'=> $appointments->where('status', 'completed')->count(),
        ]);
    }

    /**
     * POST /appointments  (patient)
     */
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date'      => 'required|date',
            'time'      => 'required',
            'reason'    => 'nullable|string',
        ]);

        $time = date('H:i:s', strtotime($request->time));

        $exists = Appointment::where('doctor_id', $request->doctor_id)
            ->where('date', $request->date)
            ->where('time', $time)
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Créneau déjà réservé'], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => Auth::id(),
            'doctor_id'  => $request->doctor_id,
            'date'       => $request->date,
            'time'       => $time,
            'reason'     => $request->reason,
            'status'     => 'pending',
        ]);

        return response()->json([
            'message'     => 'Rendez-vous créé',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * PUT /appointments/{id}  — médecin ou admin
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,completed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $user = Auth::user();

        // Admin peut tout modifier
        if ($user->role === 'admin') {
            $appointment->update(['status' => $request->status]);
            return response()->json(['message' => 'Statut mis à jour', 'appointment' => $appointment]);
        }

        // Médecin : seulement ses propres RDV
        if ($user->role === 'doctor' && $appointment->doctor_id === $user->id) {
            $appointment->update(['status' => $request->status]);
            return response()->json(['message' => 'Statut mis à jour', 'appointment' => $appointment]);
        }

        return response()->json(['message' => 'Accès refusé'], 403);
    }

    /**
     * DELETE /appointments/{id}  — annulation patient
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $user = Auth::user();

        if ($appointment->patient_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Empêcher annulation si déjà terminé/refusé
        if (in_array($appointment->status, ['completed', 'rejected'])) {
            return response()->json(['message' => 'Ce rendez-vous ne peut plus être annulé.'], 422);
        }

        $appointment->delete();

        return response()->json(['message' => 'Rendez-vous annulé']);
    }

    /**
     * GET /booked-slots/{doctorId}/{date}
     */
    public function bookedSlots($doctor_id, $date)
    {
        $slots = Appointment::where('doctor_id', $doctor_id)
            ->where('date', $date)
            ->whereIn('status', ['pending', 'accepted'])
            ->pluck('time');

        return response()->json($slots);
    }
}
