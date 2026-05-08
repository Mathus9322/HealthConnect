import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { ClipboardList, Search, AlertCircle, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [viewPresc, setViewPresc] = useState(null);

  const fetchPrescriptions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      const res = await api.get("/prescriptions", { params });
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
    const t = setTimeout(() => fetchPrescriptions(1), 300);
    return () => clearTimeout(t);
  }, [fetchPrescriptions]);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-teal-600" /> Mes Ordonnances
        </h1>
        <p className="text-gray-500 text-sm mt-1">{pagination.total} ordonnance(s) au total</p>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par médecin ou médicament..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-red-500">
          <AlertCircle className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-16 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">Aucune ordonnance pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow p-5 flex items-start gap-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setViewPresc(p)}
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={22} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800 text-sm">
                    Dr. {p.doctor?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric"
                    }) : "—"}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <Eye size={16} className="text-gray-400 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {pagination.lastPage > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white rounded-2xl shadow p-4">
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

      {/* MODAL DÉTAIL */}
      {viewPresc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} className="text-orange-500" /> Ordonnance
              </h2>
              <button onClick={() => setViewPresc(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Info médecin */}
            <div className="bg-teal-50 rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                {viewPresc.doctor?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-teal-800 text-sm">Dr. {viewPresc.doctor?.name}</p>
                <p className="text-xs text-teal-600">{viewPresc.doctor?.email}</p>
              </div>
              <p className="ml-auto text-xs text-teal-600">
                {viewPresc.created_at ? new Date(viewPresc.created_at).toLocaleDateString("fr-FR") : "—"}
              </p>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Traitement prescrit</p>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {viewPresc.description}
              </p>
            </div>

            <button
              onClick={() => setViewPresc(null)}
              className="mt-5 w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
