<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@hotel.test'],
            [
                'name' => 'Admin Hotel',
                'password' => 'admin123',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@hotel.test'],
            [
                'name' => 'Demo User',
                'password' => 'user123',
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
