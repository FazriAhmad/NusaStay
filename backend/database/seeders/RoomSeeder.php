<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $allAmenities = Amenity::pluck('id');

        $rooms = [
            [
                'name' => 'The Grand Azure Suite',
                'description' => 'Suite mewah dengan pemandangan laut, balkon pribadi, dan bathtub marble. Sarapan prasmanan gratis untuk 2 orang.',
                'price' => 2100000,
                'capacity' => 2,
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'address' => 'Jl. Sudirman No. 1, Menteng',
                'images' => ['/hero.jpg', '/about-image.jpg', '/hero.jpeg', '/beijing.png'],
            ],
            [
                'name' => 'Bali Paradise Villa',
                'description' => 'Villa pribadi dengan private pool dan view sawah Ubud. Nikmati sunset dari teras.',
                'price' => 3500000,
                'capacity' => 4,
                'province' => 'Bali',
                'city' => 'Ubud',
                'address' => 'Jl. Raya Ubud No. 88, Gianyar',
                'images' => ['/about-image.jpg', '/hero.jpeg', '/beijing.png', '/hero.jpg'],
            ],
            [
                'name' => 'Bandung Highland Lodge',
                'description' => 'Lodge cozy di kawasan Lembang dengan udara sejuk pegunungan. Cocok untuk family getaway.',
                'price' => 1250000,
                'capacity' => 4,
                'province' => 'Jawa Barat',
                'city' => 'Bandung',
                'address' => 'Jl. Raya Lembang No. 17',
                'images' => ['/beijing.png', '/hero.jpg', '/about-image.jpg', '/hero.jpeg'],
            ],
            [
                'name' => 'Yogyakarta Heritage Stay',
                'description' => 'Pengalaman menginap di bangunan heritage Jawa, dekat dengan Malioboro dan Keraton.',
                'price' => 950000,
                'capacity' => 2,
                'province' => 'DI Yogyakarta',
                'city' => 'Yogyakarta',
                'address' => 'Jl. Malioboro No. 52',
                'images' => ['/hero.jpeg', '/beijing.png', '/hero.jpg', '/about-image.jpg'],
            ],
            [
                'name' => 'Surabaya Business Suite',
                'description' => 'Suite modern di pusat bisnis Surabaya. Akses mudah ke Tunjungan Plaza.',
                'price' => 1500000,
                'capacity' => 2,
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
                'address' => 'Jl. Tunjungan No. 100',
                'images' => ['/about-image.jpg', '/hero.jpeg', '/beijing.png', '/hero.jpg'],
            ],
            [
                'name' => 'Lombok Beachfront Resort',
                'description' => 'Resort tepi pantai dengan akses langsung ke laut. Termasuk aktivitas snorkeling.',
                'price' => 2800000,
                'capacity' => 3,
                'province' => 'Nusa Tenggara Barat',
                'city' => 'Mataram',
                'address' => 'Pantai Senggigi, Lombok',
                'images' => ['/hero.jpg', '/about-image.jpg', '/hero.jpeg', '/beijing.png'],
            ],
        ];

        foreach ($rooms as $data) {
            $mainImage = $data['images'][0] ?? '/hero.jpg';
            $room = Room::updateOrCreate(
                ['name' => $data['name']],
                array_merge($data, ['image' => $mainImage])
            );
            $room->amenities()->sync(
                $allAmenities->random(min(4, $allAmenities->count()))->all()
            );
        }
    }
}
