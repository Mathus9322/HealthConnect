import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const DoctorAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Charger les rendez-vous
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/doctor/appointments");

        setAppointments(res.data.appointments);


      // 🔥 Sécurisation réponse
      // if (Array.isArray(res.data)) {
      //   setAppointments(res.data);
      // } else if (res.data.data) {
      //   setAppointments(res.data.appointments);
      // } else {
      //   setAppointments([]);
      // }
      // console.log(res.data.appointments);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les rendez-vous",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔥 Update status
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          status === "accepted"
            ? "Rendez-vous accepté"
            : "Rendez-vous refusé",
        showConfirmButton: false,
        timer: 2000,
      });

      fetchAppointments();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Action impossible",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Chargement des rendez-vous...
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">
        Gestion des Rendez-vous
      </h1>

      {appointments.length > 0 ? (
        <div className="space-y-5">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-teal-500"
            >
              <div className="flex justify-between items-center">

                {/* 👤 PATIENT */}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      appt.patient?.avatar ||
                      "https://i.pravatar.cc/150"
                    }
                    alt={appt.patient?.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-teal-500"
                  />

                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {appt.patient?.name || "Patient inconnu"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {appt.reason || "Consultation"}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      📅{" "}
                      {appt.date
                        ? new Date(appt.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        : "Date inconnue"}{" "}
                      • ⏰ {appt.time || "--:--"}
                    </p>
                  </div>
                </div>

                {/* 🎯 STATUS + ACTION */}
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appt.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : appt.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : appt.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {appt.status === "pending"
                      ? "En attente"
                      : appt.status === "accepted"
                      ? "Accepté"
                      : appt.status === "rejected"
                      ? "Refusé"
                      : "Terminé"}
                  </span>

                  {appt.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(appt.id, "accepted")}
                        className="px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accepter
                      </button>

                      <button
                        onClick={() => updateStatus(appt.id, "rejected")}
                        className="px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <p className="text-gray-500">
            Aucun rendez-vous pour le moment
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;