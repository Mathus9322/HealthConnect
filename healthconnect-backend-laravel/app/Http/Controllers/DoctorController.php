<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    /** GET /doctors */
    public function index()
    {
        return DoctorProfile::with('user')->get();
    }

    /** GET /doctors/{id} */
    public function show($id)
    {
        return DoctorProfile::with('user')->findOrFail($id);
    }

    /** PUT /doctors/{id} */
    public function update(Request $request, $id)
    {
        $doctor = DoctorProfile::findOrFail($id);
        $doctor->update($request->all());
        return response()->json($doctor);
    }

    /** GET /doctor/availability */
    public function getAvailability(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor) {
            return response()->json(['message' => 'Médecin non trouvé'], 404);
        }

        return response()->json(['available_time' => $doctor->available_time ?? []]);
    }

    /** PUT /doctor/availability */
    public function updateAvailability(Request $request)
    {
        $request->validate(['available_time' => 'required|array']);

        $doctor = $request->user()->doctorProfile;

        if (!$doctor) {
            return response()->json(['message' => 'Médecin non trouvé'], 404);
        }

        $doctor->available_time = $request->available_time;
        $doctor->save();

        return response()->json([
            'message'        => 'Disponibilité mise à jour',
            'available_time' => $doctor->available_time,
        ]);
    }

    /**
     * GET /doctor/patients
     * Liste des patients uniques qui ont eu un RDV avec ce médecin
     */
    public function myPatients()
    {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $patients = Appointment::where('doctor_id', $user->id)
            ->with(['patient.patientProfile'])
            ->get()
            ->pluck('patient')
            ->filter()
            ->unique('id')
            ->map(function ($patient) use ($user) {
                return [
                    'id'             => $patient->id,
                    'name'           => $patient->name,
                    'email'          => $patient->email,
                    'avatar'         => $patient->avatar,
                    'patientProfile' => $patient->patientProfile,
                    'appointments_count' => Appointment::where('doctor_id', $user->id)
                        ->where('patient_id', $patient->id)
                        ->count(),
                ];
            })
            ->values();

        return response()->json($patients);
    }

    /**
     * GET /doctor/patients/{patientId}/prescriptions
     * Prescriptions émises par ce médecin pour un patient
     */
    public function patientPrescriptions($patientId)
    {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $prescriptions = Prescription::where('doctor_id', $user->id)
            ->where('patient_id', $patientId)
            ->with(['patient'])
            ->latest()
            ->get();

        return response()->json($prescriptions);
    }
}
