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
        'available_time',
    ];

    protected $casts = [
    'available_time' => 'array',
];
    // 🔹 Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
