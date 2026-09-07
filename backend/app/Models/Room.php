<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'hotel', 'description', 'image', 'images', 'price', 'original_price',
    'capacity', 'bed', 'size', 'total_rooms', 'status', 'featured',
    'province', 'city', 'address',
])]
class Room extends Model
{
    protected $casts = [
        'price' => 'integer',
        'original_price' => 'integer',
        'capacity' => 'integer',
        'size' => 'integer',
        'total_rooms' => 'integer',
        'featured' => 'boolean',
        'images' => 'array',
        'avg_rating' => 'float',
        'review_count' => 'integer',
    ];

    public function blockedDates(): HasMany
    {
        return $this->hasMany(BlockedDate::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'room_amenities', 'room_id', 'amenities_id')
            ->withTimestamps();
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
