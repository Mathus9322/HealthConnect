<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    private function format($notification): array
    {
        return array_merge($notification->data, [
            'id'         => $notification->id,
            'read_at'    => $notification->read_at,
            'created_at' => $notification->created_at,
        ]);
    }

    /** GET /notifications : les 30 plus récentes + nombre de non lues */
    public function index()
    {
        $user = Auth::user();

        return response()->json([
            'unread_count'  => $user->unreadNotifications()->count(),
            'notifications' => $user->notifications()->latest()->take(30)->get()
                ->map(fn ($n) => $this->format($n))->values(),
        ]);
    }

    /** GET /notifications/unread-count */
    public function unreadCount()
    {
        return response()->json(['count' => Auth::user()->unreadNotifications()->count()]);
    }

    /** POST /notifications/{id}/read */
    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json($this->format($notification));
    }

    /** POST /notifications/read-all */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications sont lues.']);
    }

    /** DELETE /notifications/{id} */
    public function destroy($id)
    {
        Auth::user()->notifications()->findOrFail($id)->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }
}
