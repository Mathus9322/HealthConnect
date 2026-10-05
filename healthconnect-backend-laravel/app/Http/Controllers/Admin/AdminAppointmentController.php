<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Http\Controllers\AppointmentController;
use Illuminate\Http\Request;

class AdminAppointmentController extends Controller
{
    /**
     * GET /admin/appointments
     * Paramètres optionnels : search, status, per_page
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc');

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Recherche par nom patient ou médecin
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%$search%");
                })->orWhereHas('doctor', function ($dq) use ($search) {
                    $dq->where('name', 'like', "%$search%");
                })->orWhere('reason', 'like', "%$search%");
            });
        }

        $perPage      = $request->get('per_page', 10);
        $appointments = $query->paginate($perPage);

        return response()->json($appointments);
    }

    /**
     * PUT /admin/appointments/{id}
     * Modifier le statut d'un rendez-vous
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,accepted,rejected,completed',
        ]);

        $previous = $appointment->status;
        $appointment->update(['status' => $request->status]);
        if ($previous !== $appointment->status) {
            AppointmentController::notifyStatusChange($appointment, true);
        }

        return response()->json([
            'message'     => 'Statut du rendez-vous mis à jour.',
            'appointment' => $appointment->load(['patient', 'doctor']),
        ]);
    }

    /**
     * DELETE /admin/appointments/{id}
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        // Prévenir seulement pour un rendez-vous encore à venir
        if (in_array($appointment->status, ['pending', 'accepted'])) {
            AppointmentController::notifyCancelledByAdmin($appointment);
        }

        return response()->json([
            'message' => 'Rendez-vous supprimé avec succès.'
        ]);
    }
}
