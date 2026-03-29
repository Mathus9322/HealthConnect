<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    public function run()
    {
        $patients = User::where('role', 'patient')->get();
        $doctors = User::where('role', 'doctor')->get();

        foreach ($patients as $patient) {
            foreach ($doctors as $doctor) {
                Appointment::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'date' => Carbon::today()->addDays(rand(1, 30))->toDateString(),
                    'time' => rand(9, 17) . ':00',
                    'reason' => 'Checkup',
                    'status' => 'pending',
                ]);
            }
        }
    }
}
