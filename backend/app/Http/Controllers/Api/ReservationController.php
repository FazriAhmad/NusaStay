<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use App\Models\Payment;
use App\Models\PromoCode;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Reservation::with(['user:id,name,email,phone', 'room:id,name,price,image', 'payment', 'review', 'promoCode:id,code'])
            ->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage));
        $page = max(1, (int) $request->input('page', 1));

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'rooms_count' => ['nullable', 'integer', 'min:1'],
            'special_request' => ['nullable', 'string', 'max:2000'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['nullable', 'in:unpaid,paid'],
            'promo_code' => ['nullable', 'string'],
        ]);

        $room = Room::findOrFail($data['room_id']);
        $roomsCount = (int) ($data['rooms_count'] ?? 1);

        if ($room->status !== 'active') {
            return response()->json(['message' => 'Kamar sedang nonaktif.'], 422);
        }

        [$available, $reason] = $this->checkAvailability($room, $data['start_date'], $data['end_date'], $roomsCount);

        if (! $available) {
            return response()->json(['message' => $reason], 409);
        }

        $nights = max(1, (int) ceil((strtotime($data['end_date']) - strtotime($data['start_date'])) / 86400));
        $subtotal = $room->price * $nights * $roomsCount;

        $promo = null;
        $discount = 0;

        if (! empty($data['promo_code'])) {
            $promo = PromoCode::where('code', strtoupper($data['promo_code']))->first();

            if (! $promo) {
                return response()->json(['message' => 'Kode promo tidak ditemukan.'], 404);
            }

            [$ok, $message, $discount] = $promo->validateFor($subtotal);

            if (! $ok) {
                return response()->json(['message' => $message], 422);
            }
        }

        $taxPercent = (int) Setting::get('tax_percent', '0');
        $serviceFee = (int) Setting::get('service_fee', '0');
        $tax = (int) round(($subtotal - $discount) * $taxPercent / 100);
        $total = $subtotal - $discount + $tax + $serviceFee;

        $reservation = DB::transaction(function () use ($request, $data, $roomsCount, $subtotal, $tax, $serviceFee, $total, $promo, $discount) {
            $r = Reservation::create([
                'code' => Reservation::generateCode(),
                'user_id' => $request->user()->id,
                'room_id' => $data['room_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'guests' => $data['guests'] ?? 1,
                'rooms_count' => $roomsCount,
                'special_request' => $data['special_request'] ?? null,
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'service_fee' => $serviceFee,
                'price' => $total,
            ]);

            if ($promo) {
                $r->update(['promo_code_id' => $promo->id, 'discount_amount' => $discount]);
                $promo->increment('used_count');
            }

            Payment::create([
                'reservation_id' => $r->id,
                'amount' => $total,
                'method' => $data['payment_method'] ?? null,
                'status' => $data['payment_status'] ?? 'unpaid',
            ]);

            return $r;
        });

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room:id,name,image', 'payment', 'promoCode:id,code']),
        ], 201);
    }

    /** Inventory-aware availability: every night in the range needs `$need` rooms free and unblocked. */
    private function checkAvailability(Room $room, string $start, string $end, int $need): array
    {
        $cursor = Carbon::parse($start)->startOfDay();
        $last = Carbon::parse($end)->startOfDay();

        $blocked = BlockedDate::where('room_id', $room->id)
            ->whereBetween('date', [$cursor->toDateString(), $last->toDateString()])
            ->pluck('date')
            ->map(fn ($d) => $d->toDateString())
            ->all();

        $reservations = Reservation::where('room_id', $room->id)
            ->whereDoesntHave('payment', fn ($q) => $q->where('status', 'cancelled'))
            ->get(['start_date', 'end_date', 'rooms_count']);

        while ($cursor->lt($last)) {
            $day = $cursor->toDateString();

            if (in_array($day, $blocked, true)) {
                return [false, "Tidak tersedia pada {$day} (diblokir properti)."];
            }

            $used = 0;
            foreach ($reservations as $reservation) {
                if ($cursor->gte($reservation->start_date->startOfDay()) && $cursor->lt($reservation->end_date->startOfDay())) {
                    $used += $reservation->rooms_count;
                }
            }

            if ($room->total_rooms - $used < $need) {
                return [false, 'Sisa ' . max(0, $room->total_rooms - $used) . " kamar pada {$day}."];
            }

            $cursor->addDay();
        }

        return [true, null];
    }

    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'data' => $reservation->load(['user:id,name,email,phone', 'room', 'payment', 'review', 'promoCode:id,code']),
        ]);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'payment_status' => ['sometimes', 'required', 'in:unpaid,paid,cancelled'],
            'payment_method' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        if ($reservation->payment && (isset($data['payment_status']) || isset($data['payment_method']))) {
            $reservation->payment->update([
                'status' => $data['payment_status'] ?? $reservation->payment->status,
                'method' => $data['payment_method'] ?? $reservation->payment->method,
            ]);
        }

        // Moving a cancelled booking back to unpaid/paid reinstates it, so clear the cancellation trail.
        if (isset($data['payment_status']) && $data['payment_status'] !== 'cancelled' && $reservation->cancelled_by) {
            $reservation->update([
                'cancellation_reason' => null,
                'cancelled_by' => null,
                'refund_status' => 'none',
            ]);
        }

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room', 'payment', 'promoCode:id,code']),
        ]);
    }

    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted']);
    }

    /** Guest confirms they paid an outstanding booking (simulated payment settlement). */
    public function confirmPayment(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $reservation->payment || $reservation->payment->status !== 'unpaid') {
            return response()->json(['message' => 'Reservasi ini tidak menunggu pembayaran.'], 409);
        }

        $data = $request->validate([
            'method' => ['nullable', 'string', 'max:50'],
        ]);

        $reservation->payment->update([
            'status' => 'paid',
            'method' => $data['method'] ?? $reservation->payment->method,
        ]);

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room:id,name,image', 'payment', 'promoCode:id,code']),
        ]);
    }

    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($reservation->payment?->status === 'cancelled') {
            return response()->json(['message' => 'Reservasi ini sudah dibatalkan.'], 409);
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $user->isAdmin()) {
            $cutoffHours = (int) Setting::get('cancellation_cutoff_hours', '24');

            if (now()->addHours($cutoffHours)->greaterThan($reservation->start_date)) {
                return response()->json([
                    'message' => "Pembatalan mandiri hanya bisa dilakukan minimal {$cutoffHours} jam sebelum check-in. Hubungi admin untuk bantuan.",
                ], 422);
            }
        }

        $wasPaid = $reservation->payment?->status === 'paid';

        $reservation->payment?->update(['status' => 'cancelled']);
        $reservation->update([
            'cancellation_reason' => $data['reason'] ?? null,
            'cancelled_by' => $user->isAdmin() ? 'admin' : 'user',
            'refund_status' => $wasPaid ? 'requested' : 'none',
        ]);

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room', 'payment', 'review', 'promoCode:id,code']),
        ]);
    }

    public function refund(Request $request, Reservation $reservation): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'action' => ['required', 'in:approve,reject'],
        ]);

        if ($reservation->refund_status !== 'requested') {
            return response()->json([
                'message' => 'Tidak ada permintaan refund yang menunggu untuk reservasi ini.',
            ], 409);
        }

        $reservation->update([
            'refund_status' => $data['action'] === 'approve' ? 'approved' : 'rejected',
        ]);

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room', 'payment', 'review', 'promoCode:id,code']),
        ]);
    }

    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();
        $tomorrow = now()->endOfDay();

        return response()->json([
            'data' => [
                'total_rooms' => Room::count(),
                'total_users' => \App\Models\User::where('role', 'user')->count(),
                'total_reservations' => Reservation::count(),
                'total_revenue' => (int) Payment::where('status', 'paid')->sum('amount'),
                'unpaid_count' => Payment::where('status', 'unpaid')->count(),
                'today_checkins' => Reservation::whereBetween('start_date', [$today, $tomorrow])->count(),
                'pending_payments' => Payment::where('status', 'unpaid')->count(),
                'monthly_revenue' => (int) Payment::where('status', 'paid')
                    ->whereMonth('created_at', now()->month)
                    ->sum('amount'),
                'recent_reservations' => Reservation::with(['user:id,name', 'room:id,name,image', 'payment'])
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get(),
                'province_breakdown' => Room::whereNotNull('province')
                    ->select('province')
                    ->selectRaw('count(*) as count')
                    ->groupBy('province')
                    ->get(),
            ],
        ]);
    }
}
