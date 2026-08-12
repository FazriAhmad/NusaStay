<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::with('amenities')->orderBy('id');

        if ($request->filled('province')) {
            $query->where('province', $request->string('province'));
        }
        if ($request->filled('city')) {
            $query->where('city', $request->string('city'));
        }

        $rooms = $query->get();

        return response()->json(['data' => $rooms]);
    }

    public function provinces(): JsonResponse
    {
        $provinces = Room::query()
            ->whereNotNull('province')
            ->select('province')
            ->selectRaw('count(*) as rooms_count')
            ->groupBy('province')
            ->orderBy('province')
            ->get();

        return response()->json(['data' => $provinces]);
    }

    public function availability(): JsonResponse
    {
        $rooms = Room::withCount('reservations')->orderBy('id')->get();
        $data = $rooms->map(function (Room $room) {
            $activeBookings = $room->reservations_count;
            return [
                'id' => $room->id,
                'name' => $room->name,
                'province' => $room->province,
                'city' => $room->city,
                'image' => $room->image,
                'price' => $room->price,
                'capacity' => $room->capacity,
                'total_bookings' => $activeBookings,
                'status' => $activeBookings > 5 ? 'high' : ($activeBookings > 0 ? 'medium' : 'available'),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['required', 'string', 'max:500'],
            'price' => ['required', 'integer', 'min:0'],
            'capacity' => ['required', 'integer', 'min:1'],
            'province' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['integer', 'exists:amenities,id'],
        ]);

        $data['images'] = $this->extractImages($data);

        $room = Room::create($data);

        if (! empty($data['amenity_ids'])) {
            $room->amenities()->sync($data['amenity_ids']);
        }

        return response()->json(['data' => $room->load('amenities')], 201);
    }

    public function show(Room $room): JsonResponse
    {
        return response()->json(['data' => $room->load('amenities')]);
    }

    public function update(Request $request, Room $room): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'image' => ['sometimes', 'required', 'string', 'max:500'],
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['integer', 'exists:amenities,id'],
        ]);

        if (array_key_exists('images', $data) || $request->hasFile('uploaded_images')) {
            $data['images'] = $this->extractImages($data);
        }

        $room->update($data);

        if (array_key_exists('amenity_ids', $data)) {
            $room->amenities()->sync($data['amenity_ids'] ?? []);
        }

        return response()->json(['data' => $room->load('amenities')]);
    }

    public function destroy(Room $room): JsonResponse
    {
        $room->delete();

        return response()->json(['message' => 'Room deleted']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $file = $request->file('image');
        $name = Str::random(20) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('rooms', $name, 'public');

        return response()->json([
            'data' => [
                'url' => Storage::url($path),
                'path' => $path,
            ],
        ], 201);
    }

    private function extractImages(array $data): array
    {
        if (isset($data['images']) && is_string($data['images'])) {
            $decoded = json_decode($data['images'], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        if (isset($data['images']) && is_array($data['images'])) {
            return $data['images'];
        }
        return [];
    }
}
