<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'space_id',
        'customer_name',
        'customer_phone',
        'seat_type',
        'seat_number',
        'hours',
        'price_per_hour',
        'total_price',
        'receipt_url',
        'payment_method',
        'status',
        'wifi_username',
        'wifi_password',
        'services',
        'check_in_time',
        'check_out_time',
        'notes',
    ];

    protected $casts = [
        'hours' => 'integer',
        'price_per_hour' => 'decimal:2',
        'total_price' => 'decimal:2',
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
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
