<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Notifier;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * GET /admin/users
     * Paramètres optionnels : search, role, per_page
     */
    public function index(Request $request)
    {
        $query = User::with(['doctorProfile', 'patientProfile'])
            ->orderBy('created_at', 'desc');

        // Filtre par rôle
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Recherche par nom ou email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $users   = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * PUT /admin/users/{id}
     * Modifier nom, email et/ou rôle d'un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'role'  => 'sometimes|required|in:admin,doctor,patient',
        ]);

        $previousRole = $user->role;
        $user->update($request->only(['name', 'email', 'role']));

        if ($previousRole !== $user->role) {
            $labels = ['admin' => 'administrateur', 'doctor' => 'médecin', 'patient' => 'patient'];
            Notifier::send($user, 'account_updated', 'Votre compte a été modifié',
                "L'administration a changé votre rôle : vous êtes maintenant {$labels[$user->role]}.",
                "/dashboard/{$user->role}");
        }

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'user'    => $user,
        ]);
    }

    /**
     * DELETE /admin/users/{id}
     * Supprimer un utilisateur (et ses données liées via cascade)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Empêcher l'admin de se supprimer lui-même
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.'
        ]);
    }
}
