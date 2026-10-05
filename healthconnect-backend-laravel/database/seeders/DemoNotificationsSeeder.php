<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Message;
use App\Models\Prescription;
use App\Notifications\AppNotification;
use App\Services\Notifier;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

/**
 * Notifications de démonstration déduites des données existantes (30 derniers jours).
 * Ne fait rien si les notifications de démonstration ont déjà été créées (les vraies ne sont jamais touchées).
 */
class DemoNotificationsSeeder extends Seeder
{
    public function run()
    {
        if (DatabaseNotification::where('data->demo', true)->exists()) {
            return;
        }

        $since = now()->subDays(30);

        // Médecins : demandes de rendez-vous reçues
        Appointment::with(['patient', 'doctor'])->where('created_at', '>=', $since)->get()
            ->each(fn ($a) => $this->add($a->doctor_id, $a->created_at, [
                'kind'  => 'appointment_new',
                'title' => 'Nouvelle demande de rendez-vous',
                'body'  => "{$a->patient?->name} souhaite un rendez-vous " . Notifier::when($a) . ($a->reason ? " : {$a->reason}" : '.'),
                'link'  => '/doctor/appointments',
            ]));

        // Patients : réponses du médecin
        Appointment::with('doctor')->whereIn('status', ['accepted', 'rejected', 'completed'])
            ->where('updated_at', '>=', $since)->get()
            ->each(function ($a) {
                $doctor = Notifier::doctorName($a->doctor);
                $when = Notifier::when($a);
                [$kind, $title, $body] = match ($a->status) {
                    'accepted'  => ['appointment_accepted', 'Rendez-vous confirmé', "Votre rendez-vous avec {$doctor} {$when} est confirmé."],
                    'rejected'  => ['appointment_rejected', 'Rendez-vous refusé', "Votre demande de rendez-vous avec {$doctor} {$when} n'a pas pu être acceptée. Vous pouvez choisir un autre créneau."],
                    'completed' => ['appointment_completed', 'Consultation terminée', "Votre consultation avec {$doctor} est terminée. Retrouvez vos éventuelles ordonnances dans votre espace."],
                };
                // Une réponse arrive en général peu après la demande
                $at = $a->status === 'completed' ? $a->updated_at : $a->created_at->copy()->addHours(rand(1, 20))->min(now());
                $this->add($a->patient_id, $at, compact('kind', 'title', 'body') + ['link' => '/patient/appointments']);
            });

        // Patients : ordonnances
        Prescription::with('doctor')->where('created_at', '>=', $since)->get()
            ->each(fn ($p) => $this->add($p->patient_id, $p->created_at, [
                'kind'  => 'prescription_new',
                'title' => 'Nouvelle ordonnance',
                'body'  => "Dr {$p->doctor?->name} vous a prescrit une ordonnance.",
                'link'  => '/patient/prescriptions',
            ]));

        // Messages non lus : une notification par expéditeur (sauf si une vraie existe déjà)
        Message::with(['sender', 'receiver'])->whereNull('read_at')->orderBy('created_at')->get()
            ->reject(fn ($m) => DatabaseNotification::where('notifiable_id', $m->receiver_id)
                ->whereNull('read_at')->where('data->kind', 'message')->where('data->sender_id', $m->sender_id)->exists())
            ->groupBy(fn ($m) => "{$m->receiver_id}-{$m->sender_id}")
            ->each(function ($thread) {
                $last = $thread->last();
                if (!$last->sender || !$last->receiver) {
                    return;
                }
                $name = $last->sender->role === 'doctor' ? "Dr {$last->sender->name}" : $last->sender->name;
                $count = $thread->count();
                $this->add($last->receiver_id, $last->created_at, [
                    'kind'      => 'message',
                    'title'     => $count > 1 ? "{$count} nouveaux messages de {$name}" : "Nouveau message de {$name}",
                    'body'      => $last->content ? Str::limit($last->content, 90) : "Fichier joint : {$last->attachment_name}",
                    'link'      => ($last->receiver->role === 'doctor' ? '/doctor/messages' : '/patient/messages') . "?user={$last->sender_id}",
                    'sender_id' => $last->sender_id,
                    'count'     => $count,
                ], false);
            });
    }

    /** Notification datée ; lue si elle a plus de 3 jours (sauf messages non lus) */
    private function add(int $userId, Carbon $at, array $data, bool $autoRead = true): void
    {
        DatabaseNotification::create([
            'id'              => (string) Str::uuid(),
            'type'            => AppNotification::class,
            'notifiable_type' => \App\Models\User::class,
            'notifiable_id'   => $userId,
            'data'            => $data + ['demo' => true],
            'read_at'         => $autoRead && $at->lt(now()->subDays(3)) ? $at->copy()->addHours(2) : null,
            'created_at'      => $at,
            'updated_at'      => $at,
        ]);
    }
}
