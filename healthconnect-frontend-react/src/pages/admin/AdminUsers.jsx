import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  UserCheck,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ROLES = ["all", "admin", "doctor", "patient"];

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await api.get("/admin/users", { params });
      const data = res.data;
      setUsers(data.data || data);
      if (data.meta || data.last_page) {
        setPagination({
          currentPage: data.meta?.current_page || data.current_page || 1,
          lastPage: data.meta?.last_page || data.last_page || 1,
          total: data.meta?.total || data.total || 0,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      await api.put(`/admin/users/${editUser.id}`, editForm);
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...editForm } : u));
      setEditUser(null);
      showToast("Utilisateur mis à jour avec succès");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
      showToast("Utilisateur supprimé");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la suppression", "error");
    }
  };

  const roleStyle = (role) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700";
      case "doctor": return "bg-blue-100 text-blue-700";
      case "patient": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white transition ${toast.type === "error" ? "bg-red-500" : "bg-teal-600"}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-teal-600" /> Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} utilisateur(s) au total</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                roleFilter === r ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "all" ? "Tous" : r}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle className="mx-auto mb-2" />
            {error}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucun utilisateur trouvé</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Utilisateur</th>
                <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rôle</th>
                <th className="text-left p-4 font-semibold text-gray-600">Inscrit le</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleStyle(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        {pagination.lastPage > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-xs text-gray-400">
              Page {pagination.currentPage} sur {pagination.lastPage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserCheck size={20} className="text-teal-600" /> Modifier l'utilisateur
              </h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="admin">Admin</option>
                  <option value="doctor">Médecin</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-sm disabled:opacity-60"
              >
                {editLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 className="text-red-500 mx-auto mb-3" size={36} />
            <h2 className="text-lg font-bold mb-2">Supprimer l'utilisateur ?</h2>
            <p className="text-gray-500 text-sm mb-6">
              L'utilisateur <strong>{deleteConfirm.name}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
