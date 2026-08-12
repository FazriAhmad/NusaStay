<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lastSeenReservations = (int) $request->query('last_seen_reservation_id', 0);
        $lastSeenContacts = (int) $request->query('last_seen_contact_id', 0);

        $newReservations = Reservation::with(['user:id,name,email', 'room:id,name'])
            ->where('id', '>', $lastSeenReservations)
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(function (Reservation $r) {
                return [
                    'id' => 'res-' . $r->id,
                    'type' => 'reservation',
                    'title' => 'Reservasi baru',
                    'body' => sprintf(
                        '%s memesan %s (%s s/d %s)',
                        $r->user?->name ?? 'Tamu',
                        $r->room?->name ?? 'kamar',
                        $r->start_date?->format('d M Y') ?? '-',
                        $r->end_date?->format('d M Y') ?? '-'
                    ),
                    'created_at' => $r->created_at?->toIso8601String() ?? now()->toIso8601String(),
                    'reservation_id' => $r->id,
                ];
            });

        $newContacts = Contact::query()
            ->where('id', '>', $lastSeenContacts)
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(function (Contact $c) {
                return [
                    'id' => 'contact-' . $c->id,
                    'type' => 'contact',
                    'title' => 'Pesan kontak baru',
                    'body' => sprintf('%s — %s', $c->name, $c->subject),
                    'created_at' => $c->created_at?->toIso8601String() ?? now()->toIso8601String(),
                    'contact_id' => $c->id,
                ];
            });

        $items = $newReservations->merge($newContacts)
            ->sortByDesc('created_at')
            ->values()
            ->take(15)
            ->all();

        $latestReservationId = Reservation::max('id') ?? 0;
        $latestContactId = Contact::max('id') ?? 0;

        return response()->json([
            'data' => $items,
            'unread_count' => count($items),
            'latest' => [
                'reservation_id' => (int) $latestReservationId,
                'contact_id' => (int) $latestContactId,
            ],
        ]);
    }
}
