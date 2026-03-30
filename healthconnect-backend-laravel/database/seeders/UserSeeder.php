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
            [
                'name' => 'Dr. Emily Davis',
                'email' => 'emily.davis@example.com',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
        ];

        $specialties = ['Cardiology', 'Dermatology', 'Pediatrics'];
        $bios = [
            'Médecin passionné avec plus de 10 ans d\'expérience dans le domaine de la santé.',
            'Spécialisé en dermatologie, avec une approche centrée sur le patient.',
            'Pédiatre dévoué, aimant travailler avec les enfants et leurs familles.',
        ];
        $experiences = ['10', '15', '20'];
        $prices = [50, 75, 100];

        foreach ($doctors as $doc) {
            $user = User::create($doc);
            $user->doctorProfile()->create([
                'specialty' => $specialties[array_rand($specialties)],
                'experience' => $experiences[array_rand($experiences)],
                'bio' => $bios[array_rand($bios)],
                'avatar' => null,
                'price' => $prices[array_rand($prices)],
            ]);
        }

        User::create([
            'name' => 'Mathus',
            'email' => 'admin@test.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin'
        ]);

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
            $patient = User::create($pat);
            $patient->patientProfile()->create([
                'birth_date' => null,
                'gender' => null,
                'phone' => null,
                'address' => null,
                'blood_group' => null,
                'allergies' => null,
                'chronic_diseases' => null,
                'current_treatment' => null,
                'medical_history' => null,
                'emergency_contact' => null,
            ]);
        }
    }
}
