<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Services\Notifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    /**
     * GET /prescriptions
     * - Médecin → ses prescriptions émises
     * - Patient → ses prescriptions reçues
     */
    public function index(Request $request)
    {
        $user  = Auth::user();
        $query = Prescription::with(['doctor', 'patient'])->latest();

        if ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } elseif ($user->role === 'patient') {
            $query->where('patient_id', $user->id);
        }

        // Recherche optionnelle
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'like', "%$s%")
                  ->orWhereHas('patient', fn($pq) => $pq->where('name', 'like', "%$s%"))
                  ->orWhereHas('doctor',  fn($dq) => $dq->where('name', 'like', "%$s%"));
            });
        }

        $perPage = $request->get('per_page', 10);

        return response()->json($query->paginate($perPage));
    }

    /**
     * POST /prescriptions
     * Réservé aux médecins
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'patient_id'  => 'required|exists:users,id',
            'description' => 'required|string',
        ]);

        $prescription = Prescription::create([
            'doctor_id'   => $user->id,
            'patient_id'  => $request->patient_id,
            'description' => $request->description,
        ]);

        Notifier::send(
            $prescription->patient,
            'prescription_new',
            'Nouvelle ordonnance',
            "Dr {$user->name} vous a prescrit une ordonnance.",
            '/patient/prescriptions'
        );

        return response()->json([
            'message'      => 'Prescription créée.',
            'prescription' => $prescription->load(['doctor', 'patient']),
        ], 201);
    }

    /**
     * DELETE /prescriptions/{id}
     * Seul le médecin qui l'a créée peut la supprimer
     */
    public function destroy($id)
    {
        $prescription = Prescription::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'doctor' || $prescription->doctor_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $prescription->delete();

        return response()->json(['message' => 'Prescription supprimée.']);
    }
}
