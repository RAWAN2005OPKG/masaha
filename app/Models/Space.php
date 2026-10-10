<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'phone', 'region', 'internet_speed', 
        'total_seats', 'electricity', 'price_per_hour', 'services', 
        'sub_start_date', 'sub_duration_months', 'sub_end_date', 
        'sub_price', 'is_manual_disabled', 'emergency_reason', 'emergency_until'
    ];

    protected $casts = [
        'sub_start_date' => 'date',
        'sub_end_date' => 'date',
        'is_manual_disabled' => 'boolean',
        'emergency_until' => 'datetime',
    ];

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
