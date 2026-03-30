<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use Illuminate\Http\Request;

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
}
