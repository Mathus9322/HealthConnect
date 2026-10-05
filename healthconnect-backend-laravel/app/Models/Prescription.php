<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'doctor_id',
        'patient_id',
        'description'
    ];

    // Doctor
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Patient
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
