<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Setting::getAll()]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        $allowed = array_keys(Setting::defaults());
        $filtered = array_intersect_key($payload['settings'], array_flip($allowed));

        if (empty($filtered)) {
            return response()->json(['message' => 'Tidak ada setting valid untuk diperbarui.'], 422);
        }

        Setting::setMany($filtered);

        return response()->json(['data' => Setting::getAll()]);
    }
}
