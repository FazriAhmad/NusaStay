<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Payment;
use App\Models\PromoCode;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Rebuilds the room catalogue, promos and demo bookings from the NusaStay reference design.
 * Existing user accounts are kept; only the catalogue and its dependent records are replaced.
 */
class NusaStaySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->wipeCatalogue();

            $amenityIds = $this->seedAmenities();
            $roomIds = $this->seedRooms($amenityIds);
            $this->seedPromos();
            $this->seedBookings($roomIds);
            $this->seedReviews($roomIds);
        });
    }

    private function wipeCatalogue(): void
    {
        Review::query()->delete();
        Payment::query()->delete();
        Reservation::query()->delete();
        DB::table('saved_hotels')->delete();
        DB::table('blocked_dates')->delete();
        DB::table('room_amenities')->delete();
        Room::query()->delete();
        Amenity::query()->delete();
        PromoCode::query()->delete();
    }

    /** @return array<string, int> slug => amenity id */
    private function seedAmenities(): array
    {
        $seed = [
            'wifi' => ['WiFi Gratis', 'Wifi'],
            'pool' => ['Kolam Renang', 'Waves'],
            'spa' => ['Spa & Sauna', 'Sparkles'],
            'breakfast' => ['Sarapan Gratis', 'Coffee'],
            'ac' => ['AC', 'Snowflake'],
            'tv' => ['Smart TV 43"', 'Tv'],
            'parking' => ['Parkir Gratis', 'SquareParking'],
            'gym' => ['Pusat Kebugaran', 'Dumbbell'],
            'beach' => ['Akses Pantai', 'Umbrella'],
            'resto' => ['Restoran', 'UtensilsCrossed'],
            'bar' => ['Bar & Lounge', 'Wine'],
            'kids' => ['Kids Club', 'Baby'],
        ];

        $ids = [];
        foreach ($seed as $slug => [$name, $icon]) {
            $ids[$slug] = Amenity::create(['name' => $name, 'icon' => $icon])->id;
        }

        return $ids;
    }

    /**
     * @param  array<string, int>  $amenityIds
     * @return array<string, int> reference room key => room id
     */
    private function seedRooms(array $amenityIds): array
    {
        $seed = [
            'r1' => [
                'name' => 'Ocean Cliff Deluxe', 'hotel' => 'Nusa Cliff Resort & Spa',
                'province' => 'Bali', 'city' => 'Uluwatu', 'address' => 'Jl. Pantai Suluban No. 88, Uluwatu, Bali',
                'price' => 1450000, 'original_price' => 1850000, 'avg_rating' => 4.9, 'review_count' => 412,
                'images' => ['/images/hero.jpg', '/images/room-deluxe.jpg', '/images/room-suite.jpg'],
                'amenities' => ['wifi', 'pool', 'spa', 'breakfast', 'ac', 'tv', 'parking', 'beach', 'resto', 'bar'],
                'capacity' => 2, 'bed' => '1 King Bed', 'size' => 48, 'total_rooms' => 24, 'featured' => true,
                'description' => 'Kamar tebing dengan panorama Samudra Hindia, infinity pool di setiap lantai, bathtub batu alam menghadap sunset, dan layanan butler 24 jam. Desain tropis-modern dengan kayu jati dan linen premium.',
            ],
            'r2' => [
                'name' => 'Emerald Suite City View', 'hotel' => 'Nusa Grand Jakarta',
                'province' => 'DKI Jakarta', 'city' => 'Jakarta Pusat', 'address' => 'Jl. MH Thamrin Kav. 12, Jakarta Pusat',
                'price' => 980000, 'original_price' => 1200000, 'avg_rating' => 4.7, 'review_count' => 638,
                'images' => ['/images/room-jakarta.jpg', '/images/room-suite.jpg'],
                'amenities' => ['wifi', 'gym', 'resto', 'bar', 'ac', 'tv', 'parking', 'pool', 'breakfast'],
                'capacity' => 2, 'bed' => '1 King Bed', 'size' => 42, 'total_rooms' => 60, 'featured' => true,
                'description' => 'Suite eksekutif di lantai 28 dengan skyline Bundaran HI, executive lounge, bathtub marmer, mesin kopi, dan meja kerja ergonomis. Ideal untuk business trip maupun staycation.',
            ],
            'r3' => [
                'name' => 'Joglo Garden Retreat', 'hotel' => 'Nusa Heritage Yogyakarta',
                'province' => 'DI Yogyakarta', 'city' => 'Sleman', 'address' => 'Jl. Kaliurang KM 8, Sleman, Yogyakarta',
                'price' => 620000, 'original_price' => null, 'avg_rating' => 4.8, 'review_count' => 354,
                'images' => ['/images/room-jogja.jpg', '/images/room-villa2.jpg'],
                'amenities' => ['wifi', 'pool', 'breakfast', 'parking', 'resto', 'ac', 'tv', 'kids'],
                'capacity' => 3, 'bed' => '1 King + 1 Single', 'size' => 36, 'total_rooms' => 32, 'featured' => true,
                'description' => 'Kamar joglo kayu jati dengan teras taman, bantal batik tulis, dan jamu selamat datang. 10 menit ke Malioboro, akses mudah ke Candi Prambanan.',
            ],
            'r4' => [
                'name' => 'Beachfront Private Pool Villa', 'hotel' => 'Nusa Bay Lombok Villas',
                'province' => 'Nusa Tenggara Barat', 'city' => 'Senggigi', 'address' => 'Jl. Raya Senggigi KM 5, Lombok Barat, NTB',
                'price' => 2100000, 'original_price' => 2600000, 'avg_rating' => 4.9, 'review_count' => 187,
                'images' => ['/images/room-villa.jpg', '/images/hotel-bali.jpg'],
                'amenities' => ['wifi', 'pool', 'beach', 'spa', 'breakfast', 'bar', 'resto', 'parking', 'ac', 'tv'],
                'capacity' => 4, 'bed' => '2 King Bed', 'size' => 85, 'total_rooms' => 12, 'featured' => true,
                'description' => 'Vila tepi pantai dengan kolam privat 40m2, bale bengong, outdoor shower frangipani, dan akses langsung ke pasir putih Senggigi. Termasuk floating breakfast sekali menginap.',
            ],
            'r5' => [
                'name' => 'Family Deluxe Twin', 'hotel' => 'Nusa Hills Bandung',
                'province' => 'Jawa Barat', 'city' => 'Bandung', 'address' => 'Jl. Setiabudi No. 155, Bandung',
                'price' => 540000, 'original_price' => null, 'avg_rating' => 4.6, 'review_count' => 521,
                'images' => ['/images/room-deluxe2.jpg', '/images/room-deluxe.jpg'],
                'amenities' => ['wifi', 'breakfast', 'parking', 'kids', 'ac', 'tv', 'pool', 'gym'],
                'capacity' => 4, 'bed' => '2 Single Bed', 'size' => 32, 'total_rooms' => 48, 'featured' => false,
                'description' => 'Kamar keluarga sejuk Dago dengan bunk-bed anak, play corner, dan balkon pinus. Dekat Farmhouse Lembang dan Floating Market.',
            ],
            'r6' => [
                'name' => 'Skyline Executive King', 'hotel' => 'Nusa Harbor Surabaya',
                'province' => 'Jawa Timur', 'city' => 'Surabaya', 'address' => 'Jl. Tunjungan No. 20, Surabaya',
                'price' => 720000, 'original_price' => 890000, 'avg_rating' => 4.5, 'review_count' => 298,
                'images' => ['/images/room-suite.jpg', '/images/room-jakarta.jpg'],
                'amenities' => ['wifi', 'gym', 'resto', 'parking', 'ac', 'tv', 'breakfast', 'pool'],
                'capacity' => 2, 'bed' => '1 King Bed', 'size' => 38, 'total_rooms' => 55, 'featured' => false,
                'description' => 'Kamar bisnis modern di jantung kota lama Surabaya, soundproof, smart check-in, dan coworking lounge 24 jam dengan kopi single-origin.',
            ],
            'r7' => [
                'name' => 'Santorini Sunset Room', 'hotel' => 'Nusa Cliff Resort & Spa',
                'province' => 'Bali', 'city' => 'Uluwatu', 'address' => 'Jl. Pantai Suluban No. 88, Uluwatu, Bali',
                'price' => 890000, 'original_price' => null, 'avg_rating' => 4.7, 'review_count' => 265,
                'images' => ['/images/room-deluxe.jpg', '/images/hero.jpg'],
                'amenities' => ['wifi', 'pool', 'breakfast', 'ac', 'tv', 'parking', 'beach'],
                'capacity' => 2, 'bed' => '1 Queen Bed', 'size' => 30, 'total_rooms' => 30, 'featured' => false,
                'description' => 'Kamar putih-biru ala Santorini dengan balkon sunset, bean bag, dan hammock. Favorit honeymoon hemat dengan view terbaik.',
            ],
            'r8' => [
                'name' => 'Royal Joglo Presidential', 'hotel' => 'Nusa Heritage Yogyakarta',
                'province' => 'DI Yogyakarta', 'city' => 'Yogyakarta', 'address' => 'Jl. Malioboro No. 1, Yogyakarta',
                'price' => 1750000, 'original_price' => null, 'avg_rating' => 5.0, 'review_count' => 96,
                'images' => ['/images/room-villa2.jpg', '/images/room-jogja.jpg'],
                'amenities' => ['wifi', 'pool', 'spa', 'breakfast', 'resto', 'bar', 'parking', 'ac', 'tv'],
                'capacity' => 5, 'bed' => '2 King + 1 Single', 'size' => 110, 'total_rooms' => 4, 'featured' => false,
                'description' => 'Satu-satunya presidential joglo dengan pendopo privat, gamelan live on-request, chef pribadi, dan koleksi batik museum.',
            ],
        ];

        $ids = [];
        foreach ($seed as $key => $row) {
            $amenities = $row['amenities'];
            unset($row['amenities']);

            $room = Room::create([...$row, 'image' => $row['images'][0], 'status' => 'active']);
            $room->amenities()->sync(array_map(fn ($slug) => $amenityIds[$slug], $amenities));

            $ids[$key] = $room->id;
        }

        return $ids;
    }

    private function seedPromos(): void
    {
        $seed = [
            ['HEMAT20', 'percent', 20, 300000, 500000, '2027-03-31', 500, 132, true, 'Diskon 20% s.d. Rp300rb, min. belanja Rp500rb'],
            ['NUSA50', 'fixed', 50000, 50000, 300000, '2026-12-31', 1000, 410, true, 'Potongan Rp50rb, min. belanja Rp300rb'],
            ['BALI15', 'percent', 15, 500000, 1000000, '2027-01-15', 200, 45, true, 'Liburan Bali 15% s.d. Rp500rb'],
            ['STAYCATION10', 'percent', 10, 150000, 0, '2026-10-31', 800, 790, false, 'Nonaktif - kuota promosi habis masa uji'],
        ];

        foreach ($seed as [$code, $type, $value, $maxDiscount, $minSpend, $validUntil, $quota, $used, $active, $description]) {
            $promo = PromoCode::create([
                'code' => $code,
                'discount_type' => $type,
                'discount_value' => $value,
                'max_discount' => $maxDiscount,
                'min_transaction' => $minSpend,
                'valid_until' => Carbon::parse($validUntil),
                'quota' => $quota,
                'active' => $active,
                'description' => $description,
            ]);

            $promo->forceFill(['used_count' => $used])->save();
        }
    }

    /** @param array<string, int> $roomIds */
    private function seedBookings(array $roomIds): void
    {
        // Demo accounts advertised on the login screen.
        User::updateOrCreate(
            ['email' => 'admin@nusastay.id'],
            ['name' => 'Admin NusaStay', 'password' => 'admin123', 'phone' => '0811-0000-111', 'role' => 'admin', 'email_verified_at' => now()]
        );
        $guest = User::updateOrCreate(
            ['email' => 'tamu@example.com'],
            ['name' => 'Tamu Demo', 'password' => 'tamu123', 'phone' => '0812-3456-7890', 'role' => 'user', 'email_verified_at' => now()]
        );

        $putri = $this->userFor('Putri Ayu', 'putri@mail.com', '0813-9999-0000');
        $james = $this->userFor('James Wong', 'james@mail.com', '+65 9000 1111');

        $seed = [
            ['NS-8K2QXA', 'r1', $guest, -20, -18, 2, 1, 2900000, 300000, 'paid', 'Virtual Account BCA', 'Honeymoon setup'],
            ['NS-P4LM9Z', 'r2', $guest, 5, 7, 2, 1, 1960000, 50000, 'unpaid', 'QRIS', 'Lantai tinggi'],
            ['NS-Q7XD2M', 'r3', $putri, 2, 4, 3, 2, 2480000, 0, 'paid', 'Kartu Kredit', ''],
            ['NS-Z1K88P', 'r4', $james, -6, -3, 4, 1, 6300000, 500000, 'paid', 'Transfer Bank', 'Floating breakfast jam 8'],
        ];

        foreach ($seed as [$code, $roomKey, $user, $inOffset, $outOffset, $guests, $roomsCount, $subtotal, $discount, $payStatus, $method, $request]) {
            $this->createReservation(
                code: $code,
                roomId: $roomIds[$roomKey],
                userId: $user->id,
                start: now()->addDays($inOffset),
                end: now()->addDays($outOffset),
                guests: $guests,
                roomsCount: $roomsCount,
                subtotal: $subtotal,
                discount: $discount,
                payStatus: $payStatus,
                method: $method,
                specialRequest: $request,
            );
        }
    }

    /** @param array<string, int> $roomIds */
    private function seedReviews(array $roomIds): void
    {
        $seed = [
            ['r1', 'Anindya P.', 'anindya@mail.com', 5, 'Sunset-nya luar biasa! Staff ramah banget, kamar wangi dan bersih. Infinity pool sepi pas sore, puas banget.', 18],
            ['r1', 'Michael T.', 'michael@mail.com', 5, 'Best cliff view in Uluwatu. Butler arranged a perfect anniversary dinner. Will come back!', 36],
            ['r2', 'Rizky H.', 'rizky@mail.com', 4, 'Lokasi strategis dekat MRT. Sarapan variatif, cuma lift agak antre jam 8 pagi.', 41],
            ['r3', 'Sari W.', 'sari@mail.com', 5, 'Nuansa Jawanya dapet banget, anak-anak suka jamunya! Teras taman adem buat WFA.', 27],
            ['r4', 'Dewi L.', 'dewi.l@mail.com', 5, 'Floating breakfast + private pool = healing maksimal. Pantainya bersih, snorkeling gampang.', 80],
            ['r5', 'Budi S.', 'budi.s@mail.com', 4, 'Kamar family luas, bunk bed kokoh. Dekat Lembang jadi gampang jalan-jalan.', 64],
        ];

        foreach ($seed as [$roomKey, $name, $email, $rating, $comment, $daysAgo]) {
            $user = $this->userFor($name, $email, '');
            $roomId = $roomIds[$roomKey];
            $room = Room::find($roomId);

            $reservation = $this->createReservation(
                code: Reservation::generateCode(),
                roomId: $roomId,
                userId: $user->id,
                start: now()->subDays($daysAgo + 2),
                end: now()->subDays($daysAgo),
                guests: 2,
                roomsCount: 1,
                subtotal: $room->price * 2,
                discount: 0,
                payStatus: 'paid',
                method: 'QRIS',
                specialRequest: '',
            );

            Review::create([
                'reservation_id' => $reservation->id,
                'room_id' => $roomId,
                'user_id' => $user->id,
                'rating' => $rating,
                'comment' => $comment,
                'photos' => [],
                'created_at' => now()->subDays($daysAgo),
            ]);
        }
    }

    private function createReservation(
        string $code,
        int $roomId,
        int $userId,
        Carbon $start,
        Carbon $end,
        int $guests,
        int $roomsCount,
        int $subtotal,
        int $discount,
        string $payStatus,
        string $method,
        string $specialRequest,
    ): Reservation {
        $tax = (int) round(($subtotal - $discount) * 10 / 100);
        $serviceFee = 25000;
        $total = $subtotal - $discount + $tax + $serviceFee;

        $reservation = Reservation::create([
            'code' => $code,
            'user_id' => $userId,
            'room_id' => $roomId,
            'start_date' => $start->startOfDay(),
            'end_date' => $end->startOfDay(),
            'guests' => $guests,
            'rooms_count' => $roomsCount,
            'special_request' => $specialRequest ?: null,
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'service_fee' => $serviceFee,
            'price' => $total,
        ]);

        Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => $total,
            'method' => $method,
            'status' => $payStatus,
        ]);

        return $reservation;
    }

    private function userFor(string $name, string $email, string $phone): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => 'password123',
                'phone' => $phone ?: null,
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
