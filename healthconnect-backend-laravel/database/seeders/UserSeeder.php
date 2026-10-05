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
                'name' => 'Aminata Diop',
                'email' => 'aminata.diop@example.com',
                'avatar' => '/avatars/aminata-diop.svg',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
            [
                'name' => 'Moussa Ndiaye',
                'email' => 'moussa.ndiaye@example.com',
                'avatar' => '/avatars/moussa-ndiaye.svg',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
            [
                'name' => 'Fatou Sow',
                'email' => 'fatou.sow@example.com',
                'avatar' => '/avatars/fatou-sow.svg',
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ],
        ];

        $specialties = ['Cardiologie', 'Dermatologie', 'Pédiatrie'];
        $locations = [
            ['Dakar', 'Point E', 14.6950, -17.4650],
            ['Thiès', 'Thiès Ville', 14.7910, -16.9256],
            ['Saint-Louis', 'Saint-Louis', 16.0326, -16.4818],
        ];
        $bios = [
            'Médecin passionné avec plus de 10 ans d\'expérience dans le domaine de la santé.',
            'Spécialisé en dermatologie, avec une approche centrée sur le patient.',
            'Pédiatre dévoué, aimant travailler avec les enfants et leurs familles.',
        ];
        $available_times = [
            ['Monday' => ['09H-12H', '14H-17H'], 'Tuesday' => ['09H-12H', '14H-17H'], 'Wednesday' => ['09H-12H', '14H-17H']],
            ['Monday' => ['10H-12H', '14H-15H', '16H-19H'], 'Tuesday' => ['10H-18H'], 'Thursday' => ['10H-18H']],
            ['Tuesday' => ['08H-16H'], 'Wednesday' => ['08H-16H'], 'Friday' => ['08H-16H']],
        ];
        $experiences = ['10', '15', '20'];
        $prices = [10000, 15000, 25000]; // en F CFA

        foreach ($doctors as $doc) {
            $user = User::create($doc);
            [$region, $locality, $latitude, $longitude] = $locations[array_rand($locations)];
            $user->doctorProfile()->create([
                'specialty' => $specialties[array_rand($specialties)],
                'experience' => $experiences[array_rand($experiences)],
                'bio' => $bios[array_rand($bios)],
                'price' => $prices[array_rand($prices)],
                'region' => $region,
                'locality' => $locality,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'available_time' => json_encode($available_times[array_rand($available_times)]),
            ]);
        }

        User::create([
            'name' => 'Mathus',
            'email' => 'admin@test.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'avatar' => null
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
