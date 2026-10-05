import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { X, CheckCircle } from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────── */
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    : "Date inconnue";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── status config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  accepted: { label: "Accepté", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
  rejected: { label: "Refusé", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  completed: { label: "Terminé", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
};

/* ─── sub-components ───────────────────────────────────────── */
const Avatar = ({ name = "", src }) => (
  src
    ? <img src={src} alt={name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
    : (
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(name)}`}>
        {getInitials(name)}
      </div>
    )
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const FILTERS = ["Tous", "En attente", "Accepté", "Refusé", "Terminé"];
const FILTER_STATUS = {
  "Tous": null,
  "En attente": "pending",
  "Accepté": "accepted",
  "Refusé": "rejected",
  "Terminé": "completed",
};

/* ─── main ────────────────────────────────────────────────── */
const DoctorAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [updating, setUpdating] = useState(null); // appt id being updated
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availability, setAvailability] = useState({});
  const [showModal, setShowModal] = useState(false);
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/appointments");
      setAppointments(res.data.appointments);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Erreur", text: "Impossible de charger les rendez-vous" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);


  const openModal = (appt) => {
    setSelectedAppointment(appt);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const finishAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}`, { status: "completed" });

      Swal.fire({
        icon: "success",
        title: "Rendez-vous terminé",
        timer: 2000,
        showConfirmButton: false,
      });

      closeModal();
      fetchAppointments();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de terminer le rendez-vous",
      });
    }
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get("/doctor/availability");

        console.log("Disponibilité chargée:", res.data);

        let dispo = res.data.available_time; // correction ici

        if (!dispo) {
          setAvailability({});
          return;
        }

        // sécurisation JSON
        if (typeof dispo === "string") {
          dispo = JSON.parse(dispo);
        }

        // normalisation (évite erreurs undefined)
        const normalized = {};

        Object.keys(dispo).forEach((day) => {
          normalized[day] = Array.isArray(dispo[day])
            ? dispo[day]
            : [];
        });

        setAvailability(normalized);

      } catch (error) {
        console.error(error);
      }
    };

    fetchAvailability();
  }, []);

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const updated = { ...prev };
      if (updated[day]) delete updated[day];
      else updated[day] = ["09:00"];
      return updated;
    });
  };

  const addTime = (day) => {
    const time = prompt("Entrer une heure (ex: 14:00)");
    if (!time) return;

    setAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), time],
    }));
  };

  const removeTime = (day, time) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((t) => t !== time),
    }));
  };

  const saveAvailability = async () => {
    try {
      await api.put("/doctor/availability", {
        available_time: availability,
      });

      Swal.fire({
        icon: "success",
        title: "Disponibilités mises à jour",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: status === "accepted" ? "Rendez-vous accepté" : "Rendez-vous refusé",
        showConfirmButton: false, timer: 2000,
      });
      fetchAppointments();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Erreur", text: "Action impossible" });
    } finally {
      setUpdating(null);
    }
  };

  const confirmAction = async (id, status) => {
    const isAccept = status === "accepted";
    const result = await Swal.fire({
      title: isAccept ? "Accepter ce rendez-vous ?" : "Refuser ce rendez-vous ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isAccept ? "#0f766e" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isAccept ? "Oui, accepter" : "Oui, refuser",
      cancelButtonText: "Annuler",
    });
    if (result.isConfirmed) updateStatus(id, status);
  };

  /* ─── derived ─── */
  const filterStatus = FILTER_STATUS[filter];
  const filtered = filterStatus
    ? appointments.filter((a) => a.status === filterStatus)
    : appointments;

  const counts = {
    pending: appointments.filter((a) => a.status === "pending").length,
    accepted: appointments.filter((a) => a.status === "accepted").length,
    rejected: appointments.filter((a) => a.status === "rejected").length,
  };

  /* ─── loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement des rendez-vous…</p>
        </div>
      </div>
    );
  }

  /* ─── render ─── */
  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">

      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
        <p className="text-sm text-gray-500 mt-1">
          {appointments.length} rendez-vous au total
        </p>
      </div>


      {/* DISPONIBILITÉS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-teal-700 mb-4">
          Mes disponibilités
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <div key={day} className="border p-4 rounded-xl">

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">{day}</h3>

                <button
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-2 py-1 rounded ${availability[day]
                    ? "bg-red-100 text-red-600"
                    : "bg-teal-100 text-teal-600"
                    }`}
                >
                  {availability[day] ? "OFF" : "ON"}
                </button>
              </div>

              {availability[day] && (
                <>
                  {availability[day].map((time) => (
                    <div key={time} className="flex justify-between text-sm mb-1">
                      <span>{time}</span>
                      <button
                        onClick={() => removeTime(day, time)}
                        className="text-red-500"
                        aria-label="Supprimer ce créneau"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addTime(day)}
                    className="text-teal-600 text-xs mt-2"
                  >
                    + Ajouter heure
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={saveAvailability}
          className="mt-6 bg-teal-600 text-white px-6 py-2 rounded-lg"
        >
          Enregistrer
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">En attente</p>
          <p className="text-3xl font-bold text-amber-500">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Acceptés</p>
          <p className="text-3xl font-bold text-teal-600">{counts.accepted}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Refusés</p>
          <p className="text-3xl font-bold text-red-500">{counts.rejected}</p>
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === f
                ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-teal-50 hover:text-teal-700"
              }`}
          >
            {f}
            {f === "En attente" && counts.pending > 0 && (
              <span className="ml-2 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* appointment list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              {/* avatar */}
              <Avatar name={appt.patient?.name} src={appt.patient?.avatar} />

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {appt.patient?.name || "Patient inconnu"}
                  </h3>
                  <StatusBadge status={appt.status} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {appt.reason || "Consultation"}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {formatDate(appt.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {appt.time?.substring(0, 5) || "--:--"}
                  </span>
                </p>
              </div>

              {/* actions */}
              {appt.status === "pending" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => confirmAction(appt.id, "accepted")}
                    disabled={updating === appt.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {updating === appt.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    Accepter
                  </button>
                  <button
                    onClick={() => confirmAction(appt.id, "rejected")}
                    disabled={updating === appt.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Refuser
                  </button>

                </div>
              )}
              <button
                onClick={() => openModal(appt)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Ouvrir
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Aucun rendez-vous dans cette catégorie</p>
        </div>
      )}




      {showModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">

          {/* Modal */}
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-scaleIn">

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">

              <Avatar
                name={selectedAppointment.patient?.name}
                src={selectedAppointment.patient?.avatar}
              />

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedAppointment.patient?.name || "Patient inconnu"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.reason || "Consultation"}
                </p>
              </div>

              <div className="ml-auto">
                <StatusBadge status={selectedAppointment.status} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Infos */}
            <div className="grid grid-cols-2 gap-4 text-sm">

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(selectedAppointment.date)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Heure</p>
                <p className="font-semibold text-gray-800">
                  {selectedAppointment.time?.substring(0, 5) || "--:--"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-gray-400 text-xs">Motif</p>
                <p className="font-medium text-gray-800">
                  {selectedAppointment.reason || "Non spécifié"}
                </p>
              </div>

            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8">

              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Fermer
              </button>

              {selectedAppointment.status !== "completed" && (
                <button
                  onClick={() => finishAppointment(selectedAppointment.id)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <CheckCircle size={16} className="inline-block align-[-3px] mr-1.5" />Terminer le rendez-vous
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;