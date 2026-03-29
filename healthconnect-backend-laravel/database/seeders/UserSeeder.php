<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Médecins
        $doctors = [
            [
                'name' => 'Dr. Sarah Martin',
                'email' => 'sarah.martin@example.com',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
            [
                'name' => 'Dr. John Doe',
                'email' => 'john.doe@example.com',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
        ];

        foreach ($doctors as $doc) {
            $user = User::create($doc);
            $user->doctorProfile()->create([
                'specialty' => 'Cardiology',
                'experience' => '10',
                'bio' => 'Experienced cardiologist',
                'avatar' => null,
                'price' => 50,
            ]);
        }

        // Patients
        $patients = [
            [
                'name' => 'Alice Brown',
                'email' => 'alice.brown@example.com',
                'password' => Hash::make('password'),
                'role' => 'patient',
            ],
            [
                'name' => 'Bob Smith',
                'email' => 'bob.smith@example.com',
                'password' => Hash::make('password'),
                'role' => 'patient',
            ],
        ];

        foreach ($patients as $pat) {
            User::create($pat); // PatientProfile sera créé automatiquement par l'observer
        }
    }
}
