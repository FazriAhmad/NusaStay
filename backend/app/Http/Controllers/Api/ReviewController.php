<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function forRoom(Request $request, Room $room): JsonResponse
    {
        $perPage = max(1, min(50, (int) $request->input('per_page', 10)));

        $paginated = $room->reviews()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->paginate($perPage);

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

    public function store(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if ($reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($reservation->review()->exists()) {
            return response()->json(['message' => 'Reservasi ini sudah pernah direview.'], 409);
        }

        if ($reservation->payment?->status !== 'paid' || $reservation->end_date->isFuture()) {
            return response()->json([
                'message' => 'Review hanya bisa dibuat setelah menginap selesai dan pembayaran lunas.',
            ], 422);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['string'],
        ]);

        $review = DB::transaction(function () use ($reservation, $user, $data) {
            $review = Review::create([
                'reservation_id' => $reservation->id,
                'room_id' => $reservation->room_id,
                'user_id' => $user->id,
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
                'photos' => $data['photos'] ?? [],
            ]);

            $this->refreshRoomRating($reservation->room_id);

            return $review;
        });

        return response()->json(['data' => $review->load('user:id,name')], 201);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $file = $request->file('image');
        $name = Str::random(20) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('reviews', $name, 'public');

        return response()->json([
            'data' => [
                'url' => Storage::url($path),
                'path' => $path,
            ],
        ], 201);
    }

    private function refreshRoomRating(int $roomId): void
    {
        $stats = Review::where('room_id', $roomId)
            ->selectRaw('avg(rating) as avg_rating, count(*) as review_count')
            ->first();

        Room::whereKey($roomId)->update([
            'avg_rating' => round((float) $stats->avg_rating, 2),
            'review_count' => (int) $stats->review_count,
        ]);
    }
}
