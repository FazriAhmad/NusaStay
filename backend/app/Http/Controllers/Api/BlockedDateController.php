<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockedDateController extends Controller
{
    /** Block or unblock a single date for a room. */
    public function toggle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'date' => ['required', 'date'],
        ]);

        $existing = BlockedDate::where('room_id', $data['room_id'])
            ->whereDate('date', $data['date'])
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['data' => ['blocked' => false]]);
        }

        BlockedDate::create($data);

        return response()->json(['data' => ['blocked' => true]], 201);
    }
}
