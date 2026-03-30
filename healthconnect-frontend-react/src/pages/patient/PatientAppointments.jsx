import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const PatientAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 format date
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
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

  // 📌 Charger disponibilités
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctor) return;

      try {
        const res = await api.get(
          `/doctors/${selectedDoctor.id}/availability?date=${formatDate(selectedDate)}`
        );
        setAvailableSlots(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAvailability();
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
              <p className="text-gray-600">Expérience: {selectedDoctor.experience} ans</p>
            )}
            {selectedDoctor.price && (
              <p className="text-gray-600">Tarif: {selectedDoctor.price} €</p>
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
            <h3 className="font-bold mb-4">
              Horaires disponibles
            </h3>

            {availableSlots.length === 0 ? (
              <p className="text-gray-500">Aucun créneau disponible</p>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-lg font-semibold ${selectedTime === time
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 hover:bg-teal-100"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
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