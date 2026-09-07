<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('app:cancel-expired-reservations')]
#[Description('Cancel unpaid reservations left pending for more than 30 minutes, freeing up the room.')]
class CancelExpiredReservations extends Command
{
    private const HOLD_MINUTES = 30;

    public function handle(): void
    {
        $expired = Reservation::whereHas('payment', fn ($q) => $q->where('status', 'unpaid'))
            ->where('created_at', '<', now()->subMinutes(self::HOLD_MINUTES))
            ->with('payment')
            ->get();

        foreach ($expired as $reservation) {
            $reservation->payment->update(['status' => 'cancelled']);
            $reservation->update([
                'cancellation_reason' => 'Auto-cancelled: unpaid hold expired after ' . self::HOLD_MINUTES . ' minutes.',
                'cancelled_by' => 'system',
                'refund_status' => 'none',
            ]);

            Log::info('Reservation auto-cancelled (unpaid hold expired)', [
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->user_id,
                'room_id' => $reservation->room_id,
                'cancelled_by' => 'system',
            ]);
        }

        $this->info("Auto-cancelled {$expired->count()} expired reservation(s).");
    }
}
