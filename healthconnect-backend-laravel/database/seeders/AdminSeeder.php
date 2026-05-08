<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Crée un admin seulement s'il n'existe pas déjà
        User::firstOrCreate(
            ['email' => 'admin@healthconnect.com'],
            [
                'name'     => 'Administrateur',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'avatar'   => null,
            ]
        );

        $this->command->info('✅ Admin créé : admin@healthconnect.com / admin123');
    }
}
