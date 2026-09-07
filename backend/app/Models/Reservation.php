<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'code', 'user_id', 'room_id', 'start_date', 'end_date', 'price',
    'subtotal', 'tax_amount', 'service_fee',
    'guests', 'rooms_count', 'special_request',
    'cancellation_reason', 'refund_status', 'cancelled_by',
    'promo_code_id', 'discount_amount',
])]
class Reservation extends Model
{
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'integer',
        'subtotal' => 'integer',
        'tax_amount' => 'integer',
        'service_fee' => 'integer',
        'guests' => 'integer',
        'rooms_count' => 'integer',
        'discount_amount' => 'integer',
    ];

    public static function generateCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = 'NS-';
            for ($i = 0; $i < 6; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }
}
