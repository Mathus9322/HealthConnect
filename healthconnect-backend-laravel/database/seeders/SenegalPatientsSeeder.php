<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SenegalPatientsSeeder extends Seeder
{
    /**
     * Patients sénégalais avec leur dossier médical.
     * Données : database/data/senegal_patients.json (mot de passe : "password")
     */
    public function run()
    {
        $patients = json_decode(file_get_contents(database_path('data/senegal_patients.json')), true);

        foreach ($patients as $patient) {
            $user = User::firstOrNew(['email' => $patient['email']]);

            // Ne jamais transformer un compte existant d'un autre rôle
            if ($user->exists && $user->role !== 'patient') {
                continue;
            }

            $user->fill([
                'name' => $patient['name'],
                'password' => $user->password ?? Hash::make('password'),
                'role' => 'patient',
            ])->save();

            $user->patientProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'birth_date' => $patient['birth_date'],
                    'gender' => $patient['gender'],
                    'phone' => $patient['phone'],
                    'address' => $patient['address'],
                    'blood_group' => $patient['blood_group'],
                    'allergies' => $patient['allergies'],
                    'chronic_diseases' => $patient['chronic_diseases'],
                    'current_treatment' => $patient['current_treatment'],
                    'medical_history' => $patient['medical_history'],
                    'emergency_contact' => $patient['emergency_contact'],
                ]
            );
        }
    }
}
