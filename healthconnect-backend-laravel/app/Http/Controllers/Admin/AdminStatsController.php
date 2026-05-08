<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Message;
use App\Models\Prescription;

class AdminStatsController extends Controller
{
    public function index()
    {
        $totalUsers     = User::count();
        $totalAdmins    = User::where('role', 'admin')->count();
        $totalDoctors   = User::where('role', 'doctor')->count();
        $totalPatients  = User::where('role', 'patient')->count();

        $totalAppointments     = Appointment::count();
        $pendingAppointments   = Appointment::where('status', 'pending')->count();
        $acceptedAppointments  = Appointment::where('status', 'accepted')->count();
        $rejectedAppointments  = Appointment::where('status', 'rejected')->count();
        $completedAppointments = Appointment::where('status', 'completed')->count();

        $totalMessages     = Message::count();
        $totalPrescriptions = Prescription::count();

        return response()->json([
            'totalUsers'            => $totalUsers,
            'totalAdmins'           => $totalAdmins,
            'totalDoctors'          => $totalDoctors,
            'totalPatients'         => $totalPatients,
            'totalAppointments'     => $totalAppointments,
            'pendingAppointments'   => $pendingAppointments,
            'acceptedAppointments'  => $acceptedAppointments,
            'rejectedAppointments'  => $rejectedAppointments,
            'completedAppointments' => $completedAppointments,
            'totalMessages'         => $totalMessages,
            'totalPrescriptions'    => $totalPrescriptions,
        ]);
    }
}
