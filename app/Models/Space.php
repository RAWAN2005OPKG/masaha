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
        'sub_price', 'is_manual_disabled'
    ];

    protected $casts = [
        'sub_start_date' => 'date',
        'sub_end_date' => 'date',
        'is_manual_disabled' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites', 'space_id', 'user_id')->withTimestamps();
    }
}
