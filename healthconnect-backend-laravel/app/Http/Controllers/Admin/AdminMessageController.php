<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class AdminMessageController extends Controller
{
    /**
     * GET /admin/messages
     * Paramètres optionnels : search, per_page
     */
    public function index(Request $request)
    {
        $query = Message::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc');

        // Recherche par contenu ou nom expéditeur/destinataire
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%$search%")
                  ->orWhereHas('sender', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%$search%");
                  })
                  ->orWhereHas('receiver', function ($rq) use ($search) {
                      $rq->where('name', 'like', "%$search%");
                  });
            });
        }

        $perPage  = $request->get('per_page', 10);
        $messages = $query->paginate($perPage);

        return response()->json($messages);
    }

    /**
     * DELETE /admin/messages/{id}
     */
    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message supprimé avec succès.'
        ]);
    }
}
