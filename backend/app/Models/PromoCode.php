<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code', 'discount_type', 'discount_value', 'max_discount', 'min_transaction',
    'quota', 'valid_from', 'valid_until', 'active', 'description',
])]
class PromoCode extends Model
{
    protected $casts = [
        'discount_value' => 'integer',
        'max_discount' => 'integer',
        'min_transaction' => 'integer',
        'quota' => 'integer',
        'used_count' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'active' => 'boolean',
    ];

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** Validate against a subtotal and return [ok, message, discountAmount]. */
    public function validateFor(int $subtotal): array
    {
        if (! $this->active) {
            return [false, 'Kode promo tidak aktif.', 0];
        }
        if ($this->valid_from && now()->lt($this->valid_from)) {
            return [false, 'Kode promo belum berlaku.', 0];
        }
        if ($this->valid_until && now()->gt($this->valid_until)) {
            return [false, 'Kode promo sudah kedaluwarsa.', 0];
        }
        if ($this->quota !== null && $this->used_count >= $this->quota) {
            return [false, 'Kuota kode promo sudah habis.', 0];
        }
        if ($subtotal < $this->min_transaction) {
            return [false, 'Total transaksi belum memenuhi minimum kode promo ini.', 0];
        }

        $discount = $this->discount_type === 'percent'
            ? (int) round($subtotal * $this->discount_value / 100)
            : $this->discount_value;

        if ($this->max_discount !== null) {
            $discount = min($discount, $this->max_discount);
        }

        $discount = min($discount, $subtotal);

        return [true, null, $discount];
    }
}
