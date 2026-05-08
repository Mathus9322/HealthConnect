import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, X, Eye, ClipboardList,
  Phone, MapPin, Droplet, AlertCircle, ChevronRight,
} from "lucide-react";

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // dossier ouvert
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(false);

  /* ── Charger les patients du médecin ── */
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/patients");
      setPatients(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  /* ── Ouvrir dossier patient ── */
  const openPatient = async (patient) => {
    setSelected(patient);
    setPrescLoading(true);
    try {
      const res = await api.get(`/doctor/patients/${patient.id}/prescriptions`);
      setPrescriptions(res.data);
    } catch {
      setPrescriptions([]);
    } finally {
      setPrescLoading(false);
    }
  };

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const COLORS = [
    "bg-teal-100 text-teal-700", "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
  ];
  const color = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-teal-600" /> Mes Patients
          </h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} patient(s) suivi(s)</p>
        </div>
        <button
          onClick={() => navigate("/doctor/prescriptions")}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
        >
          <ClipboardList size={16} /> Nouvelle prescription
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
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
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle className="mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucun patient trouvé</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => openPatient(p)}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${color(p.name)}`}>
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                  {p.patientProfile && (
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {p.patientProfile.blood_group && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Droplet size={10} /> {p.patientProfile.blood_group}
                        </span>
                      )}
                      {p.patientProfile.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} /> {p.patientProfile.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                    {p.appointments_count ?? 0} RDV
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DOSSIER PATIENT */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${color(selected.name)}`}>
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Infos profil */}
              {selected.patientProfile ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Profil médical</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Groupe sanguin", value: selected.patientProfile.blood_group },
                      { label: "Genre", value: selected.patientProfile.gender },
                      { label: "Date de naissance", value: selected.patientProfile.birth_date },
                      { label: "Téléphone", value: selected.patientProfile.phone },
                      { label: "Allergies", value: selected.patientProfile.allergies },
                      { label: "Maladies chroniques", value: selected.patientProfile.chronic_diseases },
                      { label: "Traitement actuel", value: selected.patientProfile.current_treatment },
                      { label: "Contact urgence", value: selected.patientProfile.emergency_contact },
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="font-medium text-gray-800 text-xs">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                  {selected.patientProfile.medical_history && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-xl">
                      <p className="text-xs text-blue-500 mb-1">Antécédents médicaux</p>
                      <p className="text-sm text-gray-700">{selected.patientProfile.medical_history}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Profil médical non renseigné</p>
              )}

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Prescriptions</h3>
                  <button
                    onClick={() => {
                      setSelected(null);
                      navigate(`/doctor/prescriptions?patient_id=${selected.id}`);
                    }}
                    className="text-xs text-teal-600 font-medium hover:underline"
                  >
                    + Nouvelle
                  </button>
                </div>
                {prescLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune prescription</p>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((presc) => (
                      <div key={presc.id} className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
                        <p className="text-sm text-gray-800">{presc.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(presc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate(`/doctor/messages?patient_id=${selected.id}`);
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                >
                  💬 Envoyer un message
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
