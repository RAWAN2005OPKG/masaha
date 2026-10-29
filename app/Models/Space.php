<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'phone', 'region', 'internet_speed', 
        'total_seats', 'electricity', 'price_per_hour', 'price_private', 'price_room', 'services', 
        'sub_start_date', 'sub_duration_months', 'sub_duration_unit', 'sub_duration_value', 'sub_end_date', 
        'sub_price', 'is_manual_disabled', 'emergency_reason', 'emergency_until'
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'price_private' => 'decimal:2',
        'price_room' => 'decimal:2',
        'sub_start_date' => 'date',
        'sub_end_date' => 'date',
        'is_manual_disabled' => 'boolean',
        'emergency_until' => 'datetime',
    ];

    public function getPricePrivateAttribute($value)
    {
        if ($value !== null && (float)$value > 0) {
            return (float)$value;
        }
        $base = (float)$this->price_per_hour ?: 15;
        return round($base * 1.5, 2);
    }

    public function getPriceRoomAttribute($value)
    {
        if ($value !== null && (float)$value > 0) {
            return (float)$value;
        }
        $base = (float)$this->price_per_hour ?: 15;
        return round($base * 3, 2);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites', 'space_id', 'user_id')->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'space_id');
    }

    public function reviews()
    {
        return $this->hasMany(SpaceReview::class, 'space_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'space_id');
    }

    public function offers()
    {
        return $this->hasMany(Offer::class, 'space_id');
    }
}
