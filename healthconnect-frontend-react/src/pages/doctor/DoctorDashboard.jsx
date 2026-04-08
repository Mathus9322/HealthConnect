import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const DoctorDashboard = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState(null);
  const [stats, setStats] = useState({
    patients: 0,
    consultations: 0,
    finished_consultations : 0
  });

  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        const res = await api.get("/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats({
          patients: res.data.patientsCount || 0,
          consultations: res.data.consultationsCount || 0,
          finished_consultations: res.data.finishedConsultationsCount || 0,
        });
        setAppointments(res.data.appointments);

        // if (Array.isArray(res.data)) {
        //   setAppointments(res.data);
        // } else if (res.data.data) {
        // } else {
        //   setAppointments([]);
        // }
      } catch (error) {
        setErrorAppointments(
          "Erreur : " + (error.response?.data?.message || error.message)
        );
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [token]);


      /* ─── loading ─── */
  if (loadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement ...</p>
        </div>
      </div>
    );
  }

  if (errorAppointments) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {errorAppointments}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 flex justify-between items-center">

        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150"}
            alt="profile"
            className="w-20 h-20 rounded-full border-4 border-teal-500"
          />

          <div>
            <h1 className="text-3xl font-bold">
              Dr. {user?.name} 👨‍⚕️
            </h1>
            <p className="text-gray-500">{user?.email}</p>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full">
              Médecin
            </span>
          </div>
        </div>

        <Link
          to="/profile"
          className="bg-teal-600 text-white px-5 py-2 rounded-lg"
        >
          Voir profil
        </Link>
      </div>



      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Patients</p>
          <h2 className="text-3xl font-bold">{stats.patients}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Consultations</p>
          <h2 className="text-3xl font-bold">{stats.consultations}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Termine</p>
          <h2 className="text-3xl font-bold">
            {stats.finished_consultations}
          </h2>
        </div>
      </div>

      {/* 🔥 ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/doctor/appointments"
          className="bg-teal-600 text-white p-6 rounded-xl"
        >
          <h3 className="font-bold">Mes consultations</h3>
          <p className="text-sm opacity-90">Voir les rendez-vous</p>
        </Link>

        <Link
          to="/doctor/patients"
          className="bg-white p-6 rounded-xl shadow"
        >
          <h3 className="font-bold text-teal-700">Mes patients</h3>
          <p className="text-sm text-gray-500">
            Gérer les dossiers patients
          </p>
        </Link>

        <Link
          to="/doctor/messages"
          className="bg-blue-100 p-6 rounded-xl"
        >
          <h3 className="font-bold text-blue-700">Messages</h3>
          <p className="text-sm">Communication patients</p>
        </Link>
      </div>

      {/* 🔥 RENDEZ-VOUS */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h3 className="text-xl font-bold mb-6 text-teal-700">
          Rendez-vous récents
        </h3>

        {appointments.length > 0 ? (
          appointments.map((app) => (
            <div
              key={app.id}
              className="flex justify-between items-center p-4 border-l-4 border-teal-500 mb-3 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    app.patient?.avatar ||
                    "https://i.pravatar.cc/150"
                  }
                  alt="patient"
                  className="w-12 h-12 rounded-full"
                />

                <div>
                  <h4 className="font-semibold">
                    {app.patient?.name || "Patient"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {app.reason} • {app.date} à {app.time}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  app.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : app.status === "accepted"
                    ? "bg-blue-100 text-blue-700"
                    : app.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                {app.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            Aucun rendez-vous
          </p>
        )}
      </div>

    </div>
  );
};

export default DoctorDashboard;