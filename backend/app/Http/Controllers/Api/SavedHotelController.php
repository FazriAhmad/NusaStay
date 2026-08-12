<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\SavedHotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedHotelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ids = SavedHotel::where('user_id', $request->user()->id)
            ->pluck('room_id')
            ->all();

        return response()->json(['data' => $ids]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
        ]);

        $saved = SavedHotel::firstOrCreate([
            'user_id' => $request->user()->id,
            'room_id' => $data['room_id'],
        ]);

        return response()->json(['data' => $saved], 201);
    }

    public function destroy(Request $request, int $roomId): JsonResponse
    {
        SavedHotel::where('user_id', $request->user()->id)
            ->where('room_id', $roomId)
            ->delete();

        return response()->json(['message' => 'Removed from saved']);
    }
}
