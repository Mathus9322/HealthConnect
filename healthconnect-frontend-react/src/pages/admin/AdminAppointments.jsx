import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";

const STATUSES = ["all", "pending", "accepted", "rejected", "completed"];

const statusStyle = (status) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "accepted": return "bg-blue-100 text-blue-700";
    case "rejected": return "bg-red-100 text-red-700";
    case "completed": return "bg-teal-100 text-teal-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const statusLabel = (s) => {
  switch (s) {
    case "pending": return "En attente";
    case "accepted": return "Confirmé";
    case "rejected": return "Refusé";
    case "completed": return "Terminé";
    default: return s;
  }
};

const AdminAppointments = () => {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewAppointment, setViewAppointment] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/admin/appointments", { params });
      const data = res.data;
      setAppointments(data.data || data);
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
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchAppointments(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: newStatus } : a)
      );
      showToast(`Statut mis à jour : ${statusLabel(newStatus)}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
      showToast("Rendez-vous supprimé");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white ${toast.type === "error" ? "bg-red-500" : "bg-teal-600"}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-teal-600" /> Gestion des Rendez-vous
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} rendez-vous au total</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient, médecin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                statusFilter === s ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "Tous" : statusLabel(s)}
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
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucun rendez-vous trouvé</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Patient</th>
                <th className="text-left p-4 font-semibold text-gray-600">Médecin</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date & Heure</th>
                <th className="text-left p-4 font-semibold text-gray-600">Motif</th>
                <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">
                        {a.patient?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{a.patient?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">Dr. {a.doctor?.name}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {a.date} à {a.time}
                  </td>
                  <td className="p-4 text-gray-500 max-w-[150px] truncate">{a.reason}</td>
                  <td className="p-4">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusStyle(a.status)}`}
                    >
                      {STATUSES.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewAppointment(a)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(a)}
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
            <p className="text-xs text-gray-400">Page {pagination.currentPage} sur {pagination.lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchAppointments(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => fetchAppointments(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewAppointment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Détails du rendez-vous</h2>
              <button onClick={() => setViewAppointment(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Patient</span>
                <span className="font-medium">{viewAppointment.patient?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Médecin</span>
                <span className="font-medium">Dr. {viewAppointment.doctor?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{viewAppointment.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Heure</span>
                <span className="font-medium">{viewAppointment.time}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Motif</span>
                <span className="font-medium">{viewAppointment.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle(viewAppointment.status)}`}>
                  {statusLabel(viewAppointment.status)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setViewAppointment(null)}
              className="mt-6 w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 className="text-red-500 mx-auto mb-3" size={36} />
            <h2 className="text-lg font-bold mb-2">Supprimer ce rendez-vous ?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Le rendez-vous du <strong>{deleteConfirm.date}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
