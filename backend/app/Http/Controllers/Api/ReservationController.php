<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Reservation::with(['user:id,name,email,phone', 'room:id,name,price,image', 'payment'])
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
        ]);

        $room = Room::findOrFail($data['room_id']);

        $overlapping = Reservation::where('room_id', $room->id)
            ->where(function ($q) use ($data) {
                $q->whereBetween('start_date', [$data['start_date'], $data['end_date']])
                    ->orWhereBetween('end_date', [$data['start_date'], $data['end_date']])
                    ->orWhere(function ($q2) use ($data) {
                        $q2->where('start_date', '<=', $data['start_date'])
                            ->where('end_date', '>=', $data['end_date']);
                    });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'Kamar sudah dipesan pada rentang tanggal tersebut.',
            ], 409);
        }

        $nights = max(1, (int) ceil((strtotime($data['end_date']) - strtotime($data['start_date'])) / 86400));
        $totalPrice = $room->price * $nights;

        $reservation = DB::transaction(function () use ($request, $data, $totalPrice) {
            $r = Reservation::create([
                'user_id' => $request->user()->id,
                'room_id' => $data['room_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'price' => $totalPrice,
            ]);

            Payment::create([
                'reservation_id' => $r->id,
                'amount' => $totalPrice,
                'status' => 'unpaid',
            ]);

            return $r;
        });

        return response()->json([
            'data' => $reservation->load(['user:id,name,email', 'room:id,name,image', 'payment']),
        ], 201);
    }

    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'data' => $reservation->load(['user:id,name,email,phone', 'room', 'payment']),
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

        return response()->json([
            'data' => $reservation->fresh(['user:id,name,email,phone', 'room', 'payment']),
        ]);
    }

    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted']);
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
