<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'subject', 'message', 'read'])]
class Contact extends Model
{
    protected $casts = [
        'read' => 'boolean',
    ];
}
