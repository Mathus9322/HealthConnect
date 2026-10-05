<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Message;
use App\Models\User;
use App\Services\Notifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Messagerie patient <-> médecin.
 * Un patient peut écrire à n'importe quel médecin, un médecin à n'importe quel patient.
 */
class MessageController extends Controller
{
    // Fichiers acceptés dans la messagerie (10 Mo max)
    private const ATTACHMENT_MIMES = 'jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv';
    private const ATTACHMENT_MAX_KB = 10240;

    // Infos publiques d'un interlocuteur (avec la spécialité pour un médecin)
    private function formatUser(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'avatar'    => $user->avatar,
            'role'      => $user->role,
            'specialty' => $user->role === 'doctor' ? $user->doctorProfile?->specialty : null,
        ];
    }

    private function formatMessage(Message $message): array
    {
        return [
            'id'          => $message->id,
            'sender_id'   => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'content'     => $message->content,
            'attachment'  => $message->attachment_path ? [
                'name' => $message->attachment_name,
                'mime' => $message->attachment_mime,
                'size' => $message->attachment_size,
                'url'  => "/messages/{$message->id}/attachment",
            ] : null,
            'read_at'     => $message->read_at,
            'created_at'  => $message->created_at,
        ];
    }

    // Seuls un patient et un médecin peuvent échanger
    private function canChat(User $a, User $b): bool
    {
        $roles = [$a->role, $b->role];
        sort($roles);
        return $roles === ['doctor', 'patient'];
    }

    /** GET /conversations : interlocuteurs, dernier message et non-lus, du plus récent au plus ancien */
    public function getConversations()
    {
        $userId = Auth::id();

        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $byContact = $messages->groupBy(
            fn ($message) => $message->sender_id == $userId ? $message->receiver_id : $message->sender_id
        );

        $contacts = User::with('doctorProfile')
            ->whereIn('id', $byContact->keys())
            ->get()
            ->keyBy('id');

        $conversations = $byContact
            ->filter(fn ($_, $contactId) => $contacts->has($contactId))
            ->map(fn ($thread, $contactId) => [
                'user'         => $this->formatUser($contacts[$contactId]),
                'last_message' => $this->formatMessage($thread->first()),
                'unread_count' => $thread->where('receiver_id', $userId)->whereNull('read_at')->count(),
            ])
            ->values();

        return response()->json($conversations);
    }

    /** GET /messages/contacts : personnes à qui l'utilisateur peut écrire */
    public function contacts()
    {
        $user = Auth::user();

        $myPatientIds = collect();

        if ($user->role === 'patient') {
            $contacts = User::with('doctorProfile')->where('role', 'doctor')->orderBy('name')->get();
        } elseif ($user->role === 'doctor') {
            // Ses patients (au moins un rendez-vous) en premier, puis les autres patients
            $myPatientIds = Appointment::where('doctor_id', $user->id)->pluck('patient_id')->unique();
            $contacts = User::where('role', 'patient')->orderBy('name')->get()
                ->sortByDesc(fn ($patient) => $myPatientIds->contains($patient->id))
                ->values();
        } else {
            $contacts = collect();
        }

        return response()->json($contacts->map(function ($contact) use ($user, $myPatientIds) {
            $data = $this->formatUser($contact);
            if ($user->role === 'doctor') {
                $data['is_my_patient'] = $myPatientIds->contains($contact->id);
            }
            if ($contact->role === 'doctor') {
                $data['locality'] = $contact->doctorProfile?->locality;
                $data['region']   = $contact->doctorProfile?->region;
            }
            return $data;
        })->values());
    }

    /** GET /messages/unread-count : total des messages non lus */
    public function unreadCount()
    {
        return response()->json([
            'count' => Message::where('receiver_id', Auth::id())->whereNull('read_at')->count(),
        ]);
    }

    /** GET /messages/{userId} : fil de discussion (marque les messages reçus comme lus) */
    public function getMessages($userId)
    {
        $me = Auth::user();
        $other = User::with('doctorProfile')->findOrFail($userId);

        Message::where('sender_id', $other->id)
            ->where('receiver_id', $me->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where(function ($query) use ($me, $other) {
            $query->where('sender_id', $me->id)->where('receiver_id', $other->id);
        })->orWhere(function ($query) use ($me, $other) {
            $query->where('sender_id', $other->id)->where('receiver_id', $me->id);
        })->orderBy('created_at')->orderBy('id')->get();

        return response()->json([
            'user'     => $this->formatUser($other),
            'messages' => $messages->map(fn ($message) => $this->formatMessage($message))->values(),
        ]);
    }

    /** POST /messages : envoyer un message (texte et/ou fichier, en multipart pour un fichier) */
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content'     => 'nullable|string|max:2000|required_without:file',
            // mimes : contenu réel du fichier ; extensions : nom du fichier (évite un script renommé)
            'file'        => 'nullable|file|max:' . self::ATTACHMENT_MAX_KB
                . '|mimes:' . self::ATTACHMENT_MIMES . '|extensions:' . self::ATTACHMENT_MIMES,
        ], [
            'content.required_without' => 'Écrivez un message ou joignez un fichier.',
            'file.max'   => 'Le fichier ne doit pas dépasser 10 Mo.',
            'file.mimes' => 'Type de fichier non autorisé (images, PDF, Word, Excel, PowerPoint, texte).',
            'file.extensions' => 'Type de fichier non autorisé (images, PDF, Word, Excel, PowerPoint, texte).',
            'file.uploaded' => 'Le fichier n\'a pas pu être envoyé (trop volumineux ?).',
        ]);

        $sender = Auth::user();
        $receiver = User::findOrFail($request->receiver_id);

        if ($receiver->id === $sender->id || !$this->canChat($sender, $receiver)) {
            return response()->json([
                'message' => 'La messagerie est réservée aux échanges entre patients et médecins.',
            ], 403);
        }

        $content = trim((string) $request->input('content', ''));
        if ($content === '' && !$request->hasFile('file')) {
            return response()->json(['message' => 'Le message est vide.'], 422);
        }

        $data = [
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'content'     => $content !== '' ? $content : null,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            // Stockage privé (storage/app/private) : les fichiers ne sont jamais accessibles par URL publique
            $data['attachment_path'] = $file->storeAs(
                'messages/' . min($sender->id, $receiver->id) . '-' . max($sender->id, $receiver->id),
                Str::uuid() . '.' . $file->extension(),
                'local'
            );
            $data['attachment_name'] = Str::limit($file->getClientOriginalName(), 200, '');
            $data['attachment_mime'] = $file->getMimeType();
            $data['attachment_size'] = $file->getSize();
        }

        $message = Message::create($data);

        Notifier::message($sender, $receiver, $message->content, $message->attachment_name);

        return response()->json([
            'message' => 'Message envoyé avec succès',
            'data'    => $this->formatMessage($message),
        ], 201);
    }

    /** GET /messages/{id}/attachment : télécharger le fichier joint (participants uniquement) */
    public function attachment(Request $request, $id)
    {
        $message = Message::findOrFail($id);
        $userId = Auth::id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if (!$message->attachment_path || !Storage::disk('local')->exists($message->attachment_path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        $headers = ['Content-Type' => $message->attachment_mime];

        // Affichage dans le navigateur pour les images et PDF, téléchargement pour le reste
        return $request->boolean('download') || !Str::startsWith($message->attachment_mime, ['image/', 'application/pdf'])
            ? Storage::disk('local')->download($message->attachment_path, $message->attachment_name, $headers)
            : Storage::disk('local')->response($message->attachment_path, $message->attachment_name, $headers);
    }
}
