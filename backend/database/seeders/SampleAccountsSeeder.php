<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SampleAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Admins
            ['name' => 'Super Admin',    'email' => 'superadmin@hotel.test',  'password' => 'super123',    'role' => 'admin', 'phone' => '081234567890'],
            ['name' => 'Manager Hotel',  'email' => 'manager@hotel.test',     'password' => 'manager123',  'role' => 'admin', 'phone' => '081234567891'],

            // Regular users
            ['name' => 'Budi Santoso',   'email' => 'budi@example.com',       'password' => 'budi12345',   'role' => 'user',  'phone' => '081298765432'],
            ['name' => 'Siti Aminah',    'email' => 'siti@example.com',       'password' => 'siti12345',   'role' => 'user',  'phone' => '082134567890'],
            ['name' => 'Andi Wijaya',    'email' => 'andi@example.com',       'password' => 'andi12345',   'role' => 'user',  'phone' => '083198765432'],
            ['name' => 'Dewi Lestari',   'email' => 'dewi@example.com',       'password' => 'dewi12345',   'role' => 'user',  'phone' => '085711223344'],
        ];

        foreach ($accounts as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $data['password'],
                    'role' => $data['role'],
                    'phone' => $data['phone'],
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
