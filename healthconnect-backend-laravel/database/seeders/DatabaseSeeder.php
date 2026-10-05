<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            SenegalDoctorsSeeder::class,
            SenegalPatientsSeeder::class,
            DemoActivitySeeder::class, // remplace AppointmentSeeder (1 RDV par couple patient/médecin)
            DemoNotificationsSeeder::class,
            AdminSeeder::class,
        ]);
    }
}
