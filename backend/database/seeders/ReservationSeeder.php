<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $rooms = Room::all();

        if ($users->isEmpty() || $rooms->isEmpty()) {
            $this->command?->warn('Skipping: need users + rooms first.');
            return;
        }

        Payment::query()->delete();
        Reservation::query()->delete();

        $scenarios = [
            ['user' => 'budi@example.com',  'room' => 'The Grand Azure Suite',  'start' => '+3 days',  'nights' => 2, 'paid' => true],
            ['user' => 'budi@example.com',  'room' => 'Bandung Highland Lodge', 'start' => '+20 days', 'nights' => 4, 'paid' => false],
            ['user' => 'siti@example.com',  'room' => 'Yogyakarta Heritage Stay','start' => '+5 days',  'nights' => 3, 'paid' => true],
            ['user' => 'siti@example.com',  'room' => 'Lombok Beachfront Resort','start' => '-10 days', 'nights' => 2, 'paid' => true],
            ['user' => 'andi@example.com',  'room' => 'Surabaya Business Suite','start' => '+8 days',  'nights' => 1, 'paid' => false],
            ['user' => 'andi@example.com',  'room' => 'Bali Paradise Villa',    'start' => '+30 days', 'nights' => 5, 'paid' => false],
            ['user' => 'dewi@example.com',  'room' => 'The Grand Azure Suite',  'start' => '+12 days', 'nights' => 2, 'paid' => true],
            ['user' => 'user@hotel.test',   'room' => 'Bandung Highland Lodge', 'start' => '-5 days',  'nights' => 1, 'paid' => true],
        ];

        foreach ($scenarios as $s) {
            $user = $users->firstWhere('email', $s['user']);
            $room = $rooms->firstWhere('name', $s['room']);
            if (! $user || ! $room) continue;

            $start = Carbon::parse($s['start'])->startOfDay();
            $end = $start->copy()->addDays($s['nights']);
            $total = $room->price * $s['nights'];

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'room_id' => $room->id,
                'start_date' => $start,
                'end_date' => $end,
                'price' => $total,
            ]);

            Payment::create([
                'reservation_id' => $reservation->id,
                'method' => $s['paid'] ? 'transfer' : null,
                'amount' => $total,
                'status' => $s['paid'] ? 'paid' : 'unpaid',
            ]);
        }

        $this->command?->info('Seeded ' . count($scenarios) . ' reservations with payments.');
    }
}
