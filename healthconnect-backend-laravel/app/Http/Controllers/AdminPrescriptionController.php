<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class AdminPrescriptionController extends Controller
{
    /**
     * GET /admin/prescriptions
     * Paramètres optionnels : search, per_page
     */
    public function index(Request $request)
    {
        $query = Prescription::with(['doctor', 'patient'])
            ->orderBy('created_at', 'desc');

        // Recherche par nom patient, médecin ou description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%$search%")
                  ->orWhereHas('patient', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%$search%");
                  })
                  ->orWhereHas('doctor', function ($dq) use ($search) {
                      $dq->where('name', 'like', "%$search%");
                  });
            });
        }

        $perPage       = $request->get('per_page', 10);
        $prescriptions = $query->paginate($perPage);

        // Adapter la réponse pour correspondre aux champs attendus par le frontend
        $prescriptions->getCollection()->transform(function ($p) {
            return [
                'id'          => $p->id,
                'patient'     => $p->patient ? ['id' => $p->patient->id, 'name' => $p->patient->name] : null,
                'doctor'      => $p->doctor  ? ['id' => $p->doctor->id,  'name' => $p->doctor->name]  : null,
                'medication'  => $p->description, // colonne "description" mappée sur "medication"
                'dosage'      => null,             // non présent dans le schéma actuel
                'duration'    => null,
                'notes'       => null,
                'created_at'  => $p->created_at,
            ];
        });

        return response()->json($prescriptions);
    }

    /**
     * DELETE /admin/prescriptions/{id}
     */
    public function destroy($id)
    {
        $prescription = Prescription::findOrFail($id);
        $prescription->delete();

        return response()->json([
            'message' => 'Prescription supprimée avec succès.'
        ]);
    }
}
