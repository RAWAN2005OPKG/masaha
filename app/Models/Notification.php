<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_role',
        'space_id',
        'type',
        'title',
        'desc',
        'message',
        'is_read',
        'data',
    ];

    public function setMessageAttribute($value)
    {
        $this->attributes['desc'] = $value;
    }

    public function getMessageAttribute()
    {
        return $this->attributes['desc'] ?? '';
    }

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function space()
    {
        return $this->belongsTo(Space::class, 'space_id');
    }
}
