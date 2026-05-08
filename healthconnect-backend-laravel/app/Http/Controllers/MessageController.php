<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // Envoyer un message
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:1000'
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content
        ]);

        return response()->json([
            'message' => 'Message envoyé avec succès',
            'data' => $message->load(['sender', 'receiver'])
        ]);
    }

    // Récupérer les messages entre deux utilisateurs
    public function getMessages($user1, $user2)
    {
        // Vérifier que l'utilisateur connecté fait partie de la conversation
        if (Auth::id() != $user1 && Auth::id() != $user2) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $messages = Message::where(function ($query) use ($user1, $user2) {
            $query->where('sender_id', $user1)->where('receiver_id', $user2);
        })->orWhere(function ($query) use ($user1, $user2) {
            $query->where('sender_id', $user2)->where('receiver_id', $user1);
        })->with(['sender', 'receiver'])->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    // Récupérer les conversations d'un utilisateur (liste des interlocuteurs)
    public function getConversations()
    {
        $userId = Auth::id();

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($userId) {
                return $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
            })
            ->map(function ($messages, $otherUserId) {
                $lastMessage = $messages->first();
                $otherUser = $lastMessage->sender_id == $otherUserId ? $lastMessage->sender : $lastMessage->receiver;
                return [
                    'user' => $otherUser,
                    'last_message' => $lastMessage,
                    'unread_count' => $messages->where('receiver_id', Auth::id())->whereNull('read_at')->count()
                ];
            });

        return response()->json(array_values($conversations->toArray()));
    }
}
