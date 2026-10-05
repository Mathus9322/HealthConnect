<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
        'attachment_size',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'attachment_size' => 'integer',
    ];

    protected $hidden = [
        'attachment_path',
    ];

    protected static function booted()
    {
        // Supprimer le fichier joint avec le message
        static::deleting(function (Message $message) {
            if ($message->attachment_path) {
                Storage::disk('local')->delete($message->attachment_path);
            }
        });
    }

    // Expéditeur
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Destinataire
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
