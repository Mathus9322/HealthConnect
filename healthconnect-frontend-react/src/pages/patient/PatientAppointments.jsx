import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";

/* ─── helpers ─────────────────────────────────────────────── */
const DAY_FR = {
  Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi",
  Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche",
};
const translateDay = (d) => DAY_FR[d] || d;
const formatDate   = (d) => d.toISOString().split("T")[0];
const formatTime   = (t) => (t.length === 5 ? t + ":00" : t);

const formatFullDate = (date) =>
  date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const formatShortDate = (date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const getCurrentWeek = () => {
  const today = new Date();
  const offset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { dayName: date.toLocaleDateString("en-US", { weekday: "long" }), date };
  });
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* ─── status helpers ───────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:   { label: "En attente", bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  confirmed: { label: "Confirmé",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"  },
  rejected:  { label: "Refusé",     bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"   },
  done:      { label: "Terminé",    bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400"  },
};

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];

const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── sub-components ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.done;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const Avatar = ({ name, src, size = "md" }) => {
  const sizeClass = size === "sm" ? "w-9 h-9 text-xs" : size === "lg" ? "w-14 h-14 text-base" : "w-11 h-11 text-sm";
  if (src) return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${sizeClass} ${avatarColor(name)} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

/* ─── main component ───────────────────────────────────────── */
const PatientAppointment = () => {
  const [doctors,        setDoctors]        = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay,    setSelectedDay]    = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [selectedTime,   setSelectedTime]   = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedSlots,    setBookedSlots]    = useState([]);
  const [appointments,   setAppointments]   = useState([]);
  const [weekDays,       setWeekDays]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchParams] = useSearchParams();

  /* generate week once */
  useEffect(() => { setWeekDays(getCurrentWeek()); }, []);

  /* load doctors */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data);
        // Médecin présélectionné depuis une carte (?doctor=ID)
        const preselectedId = parseInt(searchParams.get("doctor"));
        setSelectedDoctor(res.data.find((d) => d.id === preselectedId) || res.data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* load patient appointments */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/appointments");
        setAppointments(res.data);
        console.log(appointments);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppointments();
  }, []);

  /* reset when doctor changes */
  useEffect(() => {
    if (!selectedDoctor) return;
    let times = selectedDoctor.available_time;
    if (typeof times === "string") times = JSON.parse(times);
    const days = times ? Object.keys(times) : [];
    if (days.length > 0) {
      setSelectedDay(days[0]);
      setSelectedDate(weekDays.find((d) => d.dayName === days[0])?.date || new Date());
      setAvailableTimes(times[days[0]]);
    }
    setSelectedTime(null);
  }, [selectedDoctor]);

  /* update times when day changes */
  useEffect(() => {
    if (!selectedDoctor || !selectedDay) return;
    let times = selectedDoctor.available_time;
    if (typeof times === "string") times = JSON.parse(times);
    setAvailableTimes(times[selectedDay] || []);
  }, [selectedDay]);

  /* load booked slots */
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const fetchBooked = async () => {
      try {
        const res = await api.get(`/booked-slots/${selectedDoctor.id}/${formatDate(selectedDate)}`);
        setBookedSlots(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBooked();
  }, [selectedDoctor, selectedDate]);

  const handleDayChange = (dayName, date) => {
    setSelectedDay(dayName);
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleAppointment = async () => {
    if (!selectedTime) return;
    try {
      await api.post("/appointments", {
        doctor_id: selectedDoctor.id,
        date:      formatDate(selectedDate),
        time:      formatTime(selectedTime),
        reason:    "Consultation",
      });
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Rendez-vous confirmé", showConfirmButton: false, timer: 2500 });
      setSelectedTime(null);
      // refresh list
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "Créneau indisponible", text: "Veuillez choisir un autre horaire", confirmButtonColor: "#0f766e" });
    }
  };

  const confirmAppointment = async () => {
    if (!selectedTime) {
      Swal.fire({ icon: "warning", title: "Aucun créneau sélectionné", text: "Veuillez choisir une heure", confirmButtonColor: "#0f766e" });
      return;
    }
    const result = await Swal.fire({
      title: "Confirmer le rendez-vous ?",
      html: `<p class="text-gray-500 text-sm">${formatFullDate(selectedDate)} à <strong>${selectedTime}</strong></p>`,
      icon: "question",
      showCancelButton:    true,
      confirmButtonColor:  "#0f766e",
      cancelButtonColor:   "#ef4444",
      confirmButtonText:   "Confirmer",
      cancelButtonText:    "Annuler",
    });
    if (result.isConfirmed) handleAppointment();
  };

  /* ─── derived ─── */
  const doctorTimes = (() => {
    if (!selectedDoctor) return {};
    let t = selectedDoctor.available_time;
    return typeof t === "string" ? JSON.parse(t) : (t || {});
  })();

  const availableDays = weekDays.filter(({ dayName }) => doctorTimes[dayName]);

  const normalize = (t) => t.substring(0, 5);
  const bookedSet = new Set(bookedSlots.map(normalize));

  /* ─── loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement…</p>
        </div>
      </div>
    );
  }

  /* ─── render ─── */
  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">

      {/* page header */}
      <div className="mb-8">
      <h1 className="text-3xl font-bold text-teal-700">
        Prise de Rendez-vous
      </h1>

        <p className="text-sm text-gray-500 mt-1">Choisissez un médecin, un jour et un créneau horaire</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: doctor selector ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* dropdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Choisir Médecin</p>
            <select
              className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              value={selectedDoctor?.id || ""}
              onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === parseInt(e.target.value)))}
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.user?.name || doc.name}{doc.specialty ? ` - ${doc.specialty}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* doctor card */}
          {selectedDoctor && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* avatar banner */}
              <div className="h-36 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                {(selectedDoctor.avatar || selectedDoctor.user?.avatar) ? (
                  <img
                    src={selectedDoctor.avatar || selectedDoctor.user?.avatar}
                    alt={selectedDoctor.user?.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full ring-4 ring-white shadow flex items-center justify-center text-2xl font-bold ${avatarColor(selectedDoctor.user?.name || "")}`}>
                    {getInitials(selectedDoctor.user?.name || "")}
                  </div>
                )}
              </div>

              <div className="p-5 text-center">
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedDoctor.user?.name || selectedDoctor.name}
                </h2>
                <p className="text-sm text-teal-600 mt-0.5">
                  {selectedDoctor.specialty}
                </p>

                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs text-gray-500">Disponible cette semaine</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: calendar + times ── */}
        <div className="lg:col-span-8 space-y-4">

          {/* day picker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Jour</p>
            {availableDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableDays.map(({ dayName, date }) => {
                  const active = selectedDay === dayName;
                  return (
                    <button
                      key={dayName}
                      onClick={() => handleDayChange(dayName, date)}
                      className={`flex flex-col items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                        ${active
                          ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                          : "bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-100"
                        }`}
                    >
                      <span className="font-semibold">{translateDay(dayName)}</span>
                      <span className={`text-xs mt-0.5 ${active ? "text-teal-100" : "text-gray-400"}`}>
                        {formatShortDate(date)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucune disponibilité pour ce médecin.</p>
            )}
          </div>

          {/* time slot picker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Créneau horaire</p>

            {availableTimes.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableTimes.map((time) => {
                  const isBooked   = bookedSet.has(normalize(time));
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        ${isBooked
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                          : isSelected
                            ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                            : "bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-100"
                        }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun créneau disponible pour ce jour.</p>
            )}

            {/* summary bar */}
            {selectedTime && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-teal-50 rounded-xl border border-teal-100">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">{formatFullDate(selectedDate)}</span>
                  {" "}à{" "}
                  <span className="font-semibold">{selectedTime}</span>
                </p>
              </div>
            )}

            <button
              onClick={confirmAppointment}
              disabled={!selectedTime}
              className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                ${selectedTime
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 active:scale-[0.99]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              Confirmer le rendez-vous
            </button>
          </div>
        </div>

        {/* ── FULL WIDTH: appointment list ── */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Mes rendez-vous</p>

          {appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <Avatar name={appt.doctor?.name || ""} src={appt.doctor?.avatar} size="sm" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{appt.doctor?.name ? `Dr. ${appt.doctor.name}` : "Médecin"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {appt.doctor?.specialty && <span>{appt.doctor.specialty} · </span>}
                      {new Date(appt.date).toLocaleDateString("fr-FR", {
                        weekday: "long", day: "numeric", month: "long",
                      })}{" "}
                      à {appt.time?.substring(0, 5)}
                    </p>
                  </div>

                  {appt.reason && (
                    <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      {appt.reason}
                    </span>
                  )}

                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Aucun rendez-vous pour le moment</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientAppointment;