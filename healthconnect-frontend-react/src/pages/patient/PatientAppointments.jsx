import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const PatientAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [available_time, setAvailable_time] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekDays, setWeekDays] = useState([]);

  // 🔹 Traduction jours en FR
  const translateDay = (day) => ({
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
    Sunday: "Dimanche",
  }[day] || day);

  // 🔹 Format date ISO
  const formatDate = (date) => date.toISOString().split("T")[0];

  const formatTime = (time) => (time.length === 5 ? time + ":00" : time);

  // 🔹 Récupérer semaine actuelle
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      return { dayName, date };
    });
  };

  const formatFullDate = (date) =>
    date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  // 🔹 Charger médecins
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data);
        setSelectedDoctor(res.data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 🔹 Charger jours & horaires du médecin sélectionné
  // 🔹 Changer de médecin
  useEffect(() => {
    if (!selectedDoctor) return;

    let doctorTimes = selectedDoctor.available_time;
    if (typeof doctorTimes === "string") doctorTimes = JSON.parse(doctorTimes);

    const days = doctorTimes ? Object.keys(doctorTimes) : [];
    if (days.length > 0) {
      setSelectedDay(days[0]);
      setSelectedDate(
        weekDays.find((d) => d.dayName === days[0])?.date || new Date()
      );
      setAvailable_time(doctorTimes[days[0]]);
    }

    // 🔹 Réinitialiser l'heure à chaque changement de médecin
    setSelectedTime(null);
  }, [selectedDoctor]);



  // 🔹 Changer de jour
  const handleDayChange = (dayName, date) => {
    setSelectedDay(dayName);
    setSelectedDate(date);

    // 🔹 Réinitialiser l'heure à chaque changement de jour
    setSelectedTime(null);
  };


  // 🔹 Générer semaine actuelle
  useEffect(() => {
    setWeekDays(getCurrentWeek());
  }, []);

  // 🔹 Changer horaires selon jour
  useEffect(() => {
    if (!selectedDoctor || !selectedDay) return;
    let doctorTimes = selectedDoctor.available_time;
    if (typeof doctorTimes === "string") doctorTimes = JSON.parse(doctorTimes);
    setAvailable_time(doctorTimes[selectedDay] || []);
  }, [selectedDay]);

  // 🔹 Charger créneaux déjà réservés
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDoctor || !selectedDate) return;
      try {
        const res = await api.get(
          `/booked-slots/${selectedDoctor.id}/${formatDate(selectedDate)}`
        );
        setBookedSlots(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBooked();
  }, [selectedDoctor, selectedDate]);

  // 🔹 Réserver un créneau
  const handleAppointment = async () => {
    if (!selectedTime) {
      Swal.fire({
        icon: "warning",
        title: "Aucun créneau sélectionné",
        text: "Veuillez choisir une heure",
        confirmButtonColor: "#0d9488",
      });
      return;
    }

    try {
      const payload = {
        doctor_id: selectedDoctor.id,
        date: formatDate(selectedDate),
        time: formatTime(selectedTime),
        reason: "Consultation",
      };

      await api.post("/appointments", payload);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Rendez-vous confirmé",
        showConfirmButton: false,
        timer: 2000,
      });
      setSelectedTime(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Créneau indisponible",
        text: "Veuillez choisir un autre horaire",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // 🔹 Confirmation avant réservation
  const confirmAppointment = async () => {
    const result = await Swal.fire({
      title: "Confirmer le rendez-vous ?",
      text: `Jour: ${formatFullDate(selectedDate)} | Heure: ${selectedTime}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Oui, confirmer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) handleAppointment();
  };


  // 🔹 Ajouter ces nouveaux states
  const [appointments, setAppointments] = useState([]);

  // 🔹 Charger les rendez-vous du patient
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/patient/appointments"); // endpoint pour récupérer les rdv du patient
        setAppointments(res.data);
        console.log(res);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">
        Prise de Rendez-vous
      </h1>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="col-span-5 space-y-6">
          <select
            className="w-full p-3 border rounded-lg"
            value={selectedDoctor?.id || ""}
            onChange={(e) =>
              setSelectedDoctor(
                doctors.find((d) => d.id === parseInt(e.target.value))
              )
            }
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.user.name} - {doc.speciality}
              </option>
            ))}
          </select>

          <div className="bg-white p-6 rounded-xl shadow space-y-2">
            <img
              src={
                selectedDoctor.avatar ||
                "https://randomuser.me/api/portraits/women/2.jpg"
              }
              alt={selectedDoctor.user.name}
              className="h-60 w-full object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold text-teal-700">
              {selectedDoctor.name}
            </h2>
            <p className="text-gray-500">{selectedDoctor.specialty}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-7 space-y-6">
          {/* JOURS */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-teal-700">Choisir un jour</h3>
            <div className="flex gap-3 flex-wrap">
              {weekDays.map(({ dayName, date }) => {
                let doctorTimes = selectedDoctor?.available_time;
                if (typeof doctorTimes === "string") doctorTimes = JSON.parse(doctorTimes);
                const isAvailable = doctorTimes && doctorTimes[dayName];
                if (!isAvailable) return null;

                return (
                  <button
                    key={dayName}
                    onClick={() => handleDayChange(dayName, date)}
                    className={`px-4 py-2 rounded-lg font-semibold ${selectedDay === dayName ? "bg-teal-600 text-white" : "bg-gray-100 hover:bg-teal-100"
                      }`}
                  >
                    {formatFullDate(date)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HORAIRES */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-teal-700">
              Choisir une horaire
            </h3>

            {available_time.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {available_time.map((time) => {
                  const normalizeTime = (t) => t.substring(0, 5);
                  const isBooked = bookedSlots.map(normalizeTime).includes(time);

                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg font-semibold ${isBooked
                        ? "bg-gray-300 cursor-not-allowed"
                        : selectedTime === time
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 hover:bg-teal-100"
                        }`}
                    >
                      {time} {isBooked && "❌"}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Aucun créneau disponible</p>
            )}

            <button
              onClick={confirmAppointment}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700"
            >
              Confirmer le rendez-vous
            </button>
          </div>
        </div>
      </div>
      {/* RENDEZ-VOUS DU PATIENT */}
<div className="bg-white p-6 rounded-xl shadow mt-10">
  <h3 className="font-bold mb-6 text-xl text-teal-700">Mes rendez-vous</h3>

  {appointments.length > 0 ? (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border-l-4 border-teal-500"
        >
          {/* INFO MEDECIN */}
          <div className="flex items-center gap-4 flex-1">
            <img
              src={appt.doctor_avatar || "https://i.pravatar.cc/150"}
              alt={appt.doctor_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
            />
            <div>
              <h4 className="font-semibold text-gray-800">{appt.doctor_name}</h4>
              <p className="text-xs text-gray-600 mb-1">{appt.doctor_specialty}</p>
              <p className="text-sm text-gray-500">
                {appt.reason} • {new Date(appt.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })} à {appt.time}
              </p>
            </div>
          </div>

          {/* STATUT */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              appt.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : appt.status === "confirmed"
                ? "bg-blue-100 text-blue-700"
                : appt.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-teal-100 text-teal-700"
            }`}
          >
            {appt.status === "pending"
              ? "En attente"
              : appt.status === "confirmed"
              ? "Confirmé"
              : appt.status === "rejected"
              ? "Refusé"
              : "Terminé"}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center">Aucun rendez-vous pour le moment</p>
  )}
</div>
    </div>
  );
};

export default PatientAppointment;