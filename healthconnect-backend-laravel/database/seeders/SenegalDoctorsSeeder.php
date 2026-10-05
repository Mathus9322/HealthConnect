<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SenegalDoctorsSeeder extends Seeder
{
    /**
     * Médecins répartis dans les 14 régions du Sénégal.
     * Données : database/data/senegal_doctors.json
     */
    public function run()
    {
        $doctors = json_decode(file_get_contents(database_path('data/senegal_doctors.json')), true);

        foreach ($doctors as $doc) {
            $user = User::updateOrCreate(
                ['email' => $doc['email']],
                [
                    'name' => $doc['name'],
                    'avatar' => $doc['avatar'],
                    'password' => Hash::make('password'),
                    'role' => 'doctor',
                ]
            );

            $user->doctorProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'specialty' => $doc['specialty'],
                    'experience' => $doc['experience'],
                    'bio' => $doc['bio'],
                    'price' => $doc['price'],
                    'region' => $doc['region'],
                    'locality' => $doc['locality'],
                    'latitude' => $doc['latitude'],
                    'longitude' => $doc['longitude'],
                    'available_time' => $doc['available_time'],
                ]
            );
        }
    }
}
