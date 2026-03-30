<?php

namespace App\Http\Controllers;

use App\Models\PatientProfile;
use Illuminate\Http\Request;

class PatientController extends Controller
{

    public function index()
    {
        return PatientProfile::with('user')->get();
    }

    public function show($user_id)
    {
        return PatientProfile::where('user_id', $user_id)->first();
    }

    public function update(Request $request, $user_id)
    {
        $patient = PatientProfile::where('user_id', $user_id)->first();

        $patient->update($request->all());

        return response()->json($patient);
    }
}
