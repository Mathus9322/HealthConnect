<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\AppNotification;
use Carbon\Carbon;
use Illuminate\Support\Str;

/**
 * Point central de création des notifications de l'application.
 */
class Notifier
{
    /** Envoie une notification à un ou plusieurs utilisateurs (null ignorés) */
    public static function send($users, string $kind, string $title, string $body, ?string $link = null, array $extra = []): void
    {
        foreach (collect(is_iterable($users) ? $users : [$users])->filter() as $user) {
            $user->notify(new AppNotification(array_merge([
                'kind'  => $kind,
                'title' => $title,
                'body'  => $body,
                'link'  => $link,
            ], $extra)));
        }
    }

    public static function admins()
    {
        return User::where('role', 'admin')->get();
    }

    /** "le lundi 6 octobre à 09:30" */
    public static function when(Appointment $appointment): string
    {
        $date = Carbon::parse($appointment->date)->locale('fr')->isoFormat('dddd D MMMM');
        return "le {$date} à " . substr($appointment->time, 0, 5);
    }

    public static function doctorName(?User $doctor): string
    {
        return $doctor ? "Dr {$doctor->name}" : 'le médecin';
    }

    /**
     * Nouveau message : une seule notification non lue par expéditeur,
     * mise à jour à chaque nouveau message (évite d'inonder la cloche).
     */
    public static function message(User $sender, User $receiver, ?string $content, ?string $attachmentName): void
    {
        $senderName = $sender->role === 'doctor' ? "Dr {$sender->name}" : $sender->name;
        $preview = $content ? Str::limit($content, 90) : "Fichier joint : {$attachmentName}";
        $link = ($receiver->role === 'doctor' ? '/doctor/messages' : '/patient/messages') . "?user={$sender->id}";

        $existing = $receiver->unreadNotifications()
            ->where('data->kind', 'message')
            ->where('data->sender_id', $sender->id)
            ->first();

        if ($existing) {
            $count = ($existing->data['count'] ?? 1) + 1;
            $existing->forceFill([
                'data' => array_merge($existing->data, [
                    'title' => "{$count} nouveaux messages de {$senderName}",
                    'body'  => $preview,
                    'count' => $count,
                ]),
                'created_at' => now(),
            ])->save();
            return;
        }

        self::send($receiver, 'message', "Nouveau message de {$senderName}", $preview, $link, [
            'sender_id' => $sender->id,
            'count'     => 1,
        ]);
    }
}
