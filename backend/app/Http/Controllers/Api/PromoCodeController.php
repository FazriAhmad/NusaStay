<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => PromoCode::orderByDesc('id')->get()]);
    }

    /** Active promos only — safe to show to guests on the checkout page. */
    public function publicIndex(): JsonResponse
    {
        $promos = PromoCode::where('active', true)
            ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', now()))
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $promos]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'discount_type' => ['required', 'in:percent,fixed'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'max_discount' => ['nullable', 'integer', 'min:0'],
            'min_transaction' => ['nullable', 'integer', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $data['code'] = strtoupper($data['code']);

        $promo = PromoCode::create($data)->fresh();

        return response()->json(['data' => $promo], 201);
    }

    public function update(Request $request, PromoCode $promoCode): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:promo_codes,code,' . $promoCode->id],
            'discount_type' => ['sometimes', 'required', 'in:percent,fixed'],
            'discount_value' => ['sometimes', 'required', 'integer', 'min:1'],
            'max_discount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'min_transaction' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'quota' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'valid_from' => ['sometimes', 'nullable', 'date'],
            'valid_until' => ['sometimes', 'nullable', 'date', 'after_or_equal:valid_from'],
            'active' => ['sometimes', 'boolean'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $promoCode->update($data);

        return response()->json(['data' => $promoCode->fresh()]);
    }

    public function destroy(PromoCode $promoCode): JsonResponse
    {
        $promoCode->delete();

        return response()->json(['message' => 'Promo code deleted']);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ]);

        $promo = PromoCode::where('code', strtoupper($data['code']))->first();

        if (! $promo) {
            return response()->json(['message' => 'Kode promo tidak ditemukan.'], 404);
        }

        $room = Room::findOrFail($data['room_id']);
        $nights = max(1, (int) ceil((strtotime($data['end_date']) - strtotime($data['start_date'])) / 86400));
        $subtotal = $room->price * $nights;

        [$ok, $message, $discount] = $promo->validateFor($subtotal);

        if (! $ok) {
            return response()->json(['message' => $message], 422);
        }

        return response()->json([
            'data' => [
                'code' => $promo->code,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'total' => $subtotal - $discount,
            ],
        ]);
    }
}
