<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientProfile extends Model
{
    protected $fillable = [
        'user_id',
        'birth_date',
        'gender',
        'phone',
        'address',
        'blood_group',
        'allergies',
        'chronic_diseases',
        'current_treatment',
        'medical_history',
        'emergency_contact'
    ];

    // Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
