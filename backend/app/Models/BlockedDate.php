<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['room_id', 'date'])]
class BlockedDate extends Model
{
    protected $casts = [
        'date' => 'date',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
