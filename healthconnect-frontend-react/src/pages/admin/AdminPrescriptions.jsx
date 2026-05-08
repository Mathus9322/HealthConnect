import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import {
  ClipboardList,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPrescriptions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      const res = await api.get("/admin/prescriptions", { params });
      const data = res.data;
      setPrescriptions(data.data || data);
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
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchPrescriptions(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchPrescriptions]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      showToast("Prescription supprimée");
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-teal-600" /> Gestion des Prescriptions
        </h1>
        <p className="text-gray-500 text-sm mt-1">{pagination.total} prescription(s) au total</p>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient, médecin ou médicament..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
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
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p>{error}</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucune prescription trouvée</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Patient</th>
                <th className="text-left p-4 font-semibold text-gray-600">Médecin</th>
                <th className="text-left p-4 font-semibold text-gray-600">Médicament(s)</th>
                <th className="text-left p-4 font-semibold text-gray-600">Posologie</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">
                        {p.patient?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{p.patient?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">Dr. {p.doctor?.name}</td>
                  <td className="p-4 text-gray-500 max-w-[160px] truncate">
                    {p.medication || p.medications || "—"}
                  </td>
                  <td className="p-4 text-gray-500 max-w-[120px] truncate">
                    {p.dosage || "—"}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewPrescription(p)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
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
              <button onClick={() => fetchPrescriptions(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => fetchPrescriptions(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewPrescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} className="text-teal-600" /> Détails de la prescription
              </h2>
              <button onClick={() => setViewPrescription(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Patient</span>
                <span className="font-medium">{viewPrescription.patient?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Médecin</span>
                <span className="font-medium">Dr. {viewPrescription.doctor?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Médicament(s)</span>
                <span className="font-medium">{viewPrescription.medication || viewPrescription.medications || "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Posologie</span>
                <span className="font-medium">{viewPrescription.dosage || "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Durée</span>
                <span className="font-medium">{viewPrescription.duration || "—"}</span>
              </div>
              {viewPrescription.notes && (
                <div className="pt-2">
                  <p className="text-gray-500 mb-2">Notes</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-800">{viewPrescription.notes}</div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {viewPrescription.created_at ? new Date(viewPrescription.created_at).toLocaleDateString("fr-FR") : "—"}
                </span>
              </div>
            </div>
            <button onClick={() => setViewPrescription(null)} className="mt-6 w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
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
            <h2 className="text-lg font-bold mb-2">Supprimer cette prescription ?</h2>
            <p className="text-gray-500 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;
