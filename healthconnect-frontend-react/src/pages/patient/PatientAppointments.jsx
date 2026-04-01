import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const PatientAppointment = () => {

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [available_time, setAvailable_time] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Traduction jours
  const translateDay = (day) => {
    const map = {
      Monday: "Lundi",
      Tuesday: "Mardi",
      Wednesday: "Mercredi",
      Thursday: "Jeudi",
      Friday: "Vendredi",
      Saturday: "Samedi",
      Sunday: "Dimanche",
    };
    return map[day] || day;
  };

  // 🔥 Format date
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (time) => {
    return time.length === 5 ? time + ":00" : time;
  };

  // 🔥 Jour → vraie date
  const getNextDateFromDay = (dayName) => {
    const daysMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = daysMap[dayName];

    let diff = targetDay - todayDay;
    if (diff <= 0) diff += 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + diff);

    return nextDate;
  };

  // 📌 Charger médecins
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

  // 📌 Charger jours & horaires
  useEffect(() => {
    if (!selectedDoctor) return;

    let doctorTimes = selectedDoctor.available_time;

    try {
      if (typeof doctorTimes === "string") {
        doctorTimes = JSON.parse(doctorTimes);
      }
    } catch (error) {
      console.error(error);
    }

    const days = doctorTimes ? Object.keys(doctorTimes) : [];

    if (days.length > 0) {
      setSelectedDay(days[0]);
      setAvailable_time(doctorTimes[days[0]]);
    }

  }, [selectedDoctor]);

  // 📌 Changer horaires selon jour
  useEffect(() => {
    if (!selectedDoctor || !selectedDay) return;

    let doctorTimes = selectedDoctor.available_time;

    if (typeof doctorTimes === "string") {
      doctorTimes = JSON.parse(doctorTimes);
    }

    setAvailable_time(doctorTimes[selectedDay] || []);

  }, [selectedDay]);

  // 📌 Charger créneaux déjà réservés
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDoctor || !selectedDay) return;

      const date = formatDate(getNextDateFromDay(selectedDay));

      try {
        const res = await api.get(
          `/booked-slots/${selectedDoctor.id}/${date}`
        );

        setBookedSlots(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBooked();
  }, [selectedDoctor, selectedDay]);

  // 📌 Réservation
  const handleAppointment = async () => {
    if (!selectedTime) {
      alert("Choisir une heure !");
      return;
    }

    try {
      const appointmentDate = getNextDateFromDay(selectedDay);

      const payload = {
        doctor_id: selectedDoctor.id,
        date: formatDate(appointmentDate),
        time: formatTime(selectedTime), // 🔥 FIX
        reason: "Consultation"
      };

      await api.post("/appointments", payload);

      console.log("DATE ENVOYÉE:", formatDate(appointmentDate));
      console.log("TIME ENVOYÉ:", selectedTime);
      alert("✅ Rendez-vous confirmé !");
      setSelectedTime(null);
    } catch (error) {
      console.error(error);
      alert("❌ Créneau indisponible");
    }
  };

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
              src={selectedDoctor.avatar || "https://randomuser.me/api/portraits/women/2.jpg"}
              alt={selectedDoctor.user.name}
              className="h-60 w-full object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold text-teal-700">{selectedDoctor.name}</h2>
            <p className="text-gray-500">{selectedDoctor.specialty}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-7 space-y-6">

          {/* JOURS */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-teal-700">
              Choisir un jour
            </h3>

            <div className="flex gap-3 flex-wrap">
              {Object.keys(
                typeof selectedDoctor.available_time === "string"
                  ? JSON.parse(selectedDoctor.available_time)
                  : selectedDoctor.available_time
              ).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-semibold ${selectedDay === day
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 hover:bg-teal-100"
                    }`}
                >
                  {translateDay(day)}
                </button>
              ))}
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

                  const isBooked = bookedSlots
                    .map(normalizeTime)
                    .includes(time);

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
              onClick={handleAppointment}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700"
            >
              Confirmer le rendez-vous
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientAppointment;