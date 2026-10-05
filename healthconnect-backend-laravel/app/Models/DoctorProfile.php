<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'specialty',
        'experience',
        'bio',
        'price',
        'region',
        'locality',
        'latitude',
        'longitude',
        'available_time',
    ];

    protected $casts = [
    'available_time' => 'array',
    'latitude' => 'float',
    'longitude' => 'float',
];
    // Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
