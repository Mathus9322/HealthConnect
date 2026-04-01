import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const PatientAppointment = () => {

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [available_time, setAvailable_time] = useState([]);
  const [loading, setLoading] = useState(true);


  // 🔥 format date
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
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

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    let times = [];

    try {
      let doctorTimes = selectedDoctor.available_time;

      // Si c'est une string JSON
      if (typeof doctorTimes === "string") {
        doctorTimes = JSON.parse(doctorTimes);
      }

      // Si c'est un objet par jour
      if (doctorTimes && typeof doctorTimes === "object") {
        const dayName = getDayName(selectedDate);
        times = doctorTimes[dayName] || [];
      }

      console.log("Jour:", getDayName(selectedDate));
      console.log("Créneaux:", times);

    } catch (error) {
      console.error("Erreur parsing available_time:", error);
    }

    setAvailable_time(times);

  }, [selectedDoctor, selectedDate]);
  // 📌 Réservation
  const handleAppointment = async () => {
    if (!selectedTime) {
      alert("Choisir une heure !");
      return;
    }

    try {
      const payload = {
        doctor_id: selectedDoctor.id,
        date: formatDate(selectedDate),
        time: selectedTime,
        reason: "Consultation"
      };

      await api.post("/appointments", payload);

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

          {/* SELECT DOCTOR */}
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

          {/* DOCTOR CARD */}
          <div className="bg-white p-6 rounded-xl shadow space-y-2">
            <img
              src={selectedDoctor.avatar || "https://randomuser.me/api/portraits/women/2.jpg"}
              alt={selectedDoctor.user.name}
              className="h-60 w-full object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold text-teal-700">{selectedDoctor.name}</h2>
            <p className="text-gray-500">{selectedDoctor.specialty}</p>
            {selectedDoctor.experience && (
              <p className="text-gray-600">Expérience: <strong className="text-teal-900">{selectedDoctor.experience}</strong> ans</p>
            )}
            {selectedDoctor.price && (
              <p className="text-gray-600">Tarif: <strong className="text-teal-900">{selectedDoctor.price}</strong> €</p>
            )}
            {selectedDoctor.rating && (
              <p className="text-gray-600">Note: {selectedDoctor.rating} / 5</p>
            )}
            {selectedDoctor.bio && (
              <p className="text-sm mt-2 text-gray-700">{selectedDoctor.bio}</p>
            )}
            {selectedDoctor.contact && (
              <p className="text-gray-600">Contact: {selectedDoctor.contact}</p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-7 space-y-6">

          {/* CALENDAR */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4">Choisir une date</h3>

            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className="w-full p-3 border rounded-lg"
            />
          </div>


          {/* TIME SLOTS */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-teal-700">
              choisir une horaire
            </h3>

            {Array.isArray(available_time) && available_time.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {available_time.map((time_available) => (
                  <button
                    key={time_available}
                    onClick={() => setSelectedTime(time_available)}
                    className={`py-2 rounded-lg font-semibold ${selectedTime === time_available
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 hover:bg-teal-100"
                      }`}
                  >
                    {time_available}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun créneau disponible</p>
            )}

            {/* BUTTON */}
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