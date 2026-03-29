<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date',
        'time',
        'reason',
        'status'
    ];

    // 🔹 Patient (User)
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    // 🔹 Doctor (User)
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
