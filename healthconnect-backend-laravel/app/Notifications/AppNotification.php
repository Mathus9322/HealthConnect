<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Notification affichée dans l'application (cloche).
 * data : kind (appointment_new, message…), title, body, link (route du frontend), + infos facultatives
 */
class AppNotification extends Notification
{
    public function __construct(private array $data)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return $this->data;
    }
}
