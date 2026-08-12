<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $items = ['Wi-Fi', 'AC', 'TV', 'Breakfast', 'Mini Bar', 'Bathtub', 'Sea View', 'Pool Access'];

        foreach ($items as $name) {
            Amenity::updateOrCreate(['name' => $name]);
        }
    }
}
