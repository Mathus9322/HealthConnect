import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList, Search, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, X, Plus,
} from "lucide-react";

const DoctorPrescriptions = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patient_id");

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(!!preselectedPatientId);
  const [form, setForm] = useState({ patient_id: preselectedPatientId || "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Charger mes patients (pour le select) ── */
  useEffect(() => {
    api.get("/doctor/patients").then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  /* ── Charger mes prescriptions ── */
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchPrescriptions(1), 300);
    return () => clearTimeout(t);
  }, [fetchPrescriptions]);

  /* ── Soumettre prescription ── */
  const handleSubmit = async () => {
    setFormError(null);
    if (!form.patient_id) { setFormError("Veuillez sélectionner un patient."); return; }
    if (!form.description.trim()) { setFormError("La description est obligatoire."); return; }
    try {
      setSubmitting(true);
      await api.post("/prescriptions", form);
      showToast("Prescription créée avec succès");
      setForm({ patient_id: "", description: "" });
      setShowForm(false);
      fetchPrescriptions(1);
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
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
            <ClipboardList className="text-teal-600" /> Prescriptions
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} prescription(s) au total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
        >
          <Plus size={16} /> Nouvelle prescription
        </button>
      </div>

      {/* FORMULAIRE NOUVELLE PRESCRIPTION */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Plus size={18} className="text-teal-600" /> Nouvelle prescription
            </h2>
            <button onClick={() => { setShowForm(false); setFormError(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Médicaments *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Amoxicilline 500mg — 1 comprimé 3x/jour pendant 7 jours..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setShowForm(false); setFormError(null); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Enregistrer la prescription"}
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : prescriptions.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucune prescription trouvée</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Patient</th>
                <th className="text-left p-4 font-semibold text-gray-600">Description</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                        {p.patient?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.patient?.name}</p>
                        <p className="text-xs text-gray-400">{p.patient?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{p.description}</p>
                  </td>
                  <td className="p-4 text-gray-400 text-xs whitespace-nowrap">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
    </div>
  );
};

export default DoctorPrescriptions;
