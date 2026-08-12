<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmenityController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Amenity::orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:amenities,name'],
        ]);

        $amenity = Amenity::create($data);

        return response()->json(['data' => $amenity], 201);
    }

    public function update(Request $request, Amenity $amenity): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:amenities,name,' . $amenity->id],
        ]);

        $amenity->update($data);

        return response()->json(['data' => $amenity]);
    }

    public function destroy(Amenity $amenity): JsonResponse
    {
        $amenity->delete();

        return response()->json(['message' => 'Amenity deleted']);
    }
}
