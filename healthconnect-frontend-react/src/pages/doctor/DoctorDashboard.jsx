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
    finished_consultations: 0,
  });

  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        const res = await api.get("/doctor/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          patients: res.data.patientsCount || 0,
          consultations: res.data.consultationsCount || 0,
          finished_consultations:
            res.data.finishedConsultationsCount || 0,
        });

        setAppointments(res.data.appointments || []);
      } catch (error) {
        setErrorAppointments(
          error.response?.data?.message || error.message
        );
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [token]);

  if (loadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* 🔥 HEADER */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-lg mb-10">

        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150"}
            alt="profile"
            className="w-20 h-20 rounded-full border-4 border-white shadow"
          />

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Dr. {user?.name}
            </h1>
            <p className="text-teal-100 text-sm">{user?.email}</p>

            <span className="mt-2 inline-block bg-white/20 px-3 py-1 text-xs rounded-full">
              🟢 En ligne
            </span>
          </div>
        </div>

        <Link
          to="/profile"
          className="mt-4 md:mt-0 bg-white text-teal-600 px-5 py-2 rounded-xl font-medium shadow hover:scale-105 transition"
        >
          Voir profil
        </Link>
      </div>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-400">Patients</p>
          <h2 className="text-3xl font-bold text-teal-600">
            {stats.patients}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-400">Consultations</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {stats.consultations}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-400">Terminées</p>
          <h2 className="text-3xl font-bold text-gray-700">
            {stats.finished_consultations}
          </h2>
        </div>

      </div>

      {/* 🔥 ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <Link
          to="/doctor/appointments"
          className="bg-teal-600 text-white p-6 rounded-2xl shadow hover:scale-105 transition"
        >
          <h3 className="font-bold text-lg mb-1">
            📅 Mes consultations
          </h3>
          <p className="text-sm opacity-90">
            Gérer vos rendez-vous
          </p>
        </Link>

        <Link
          to="/doctor/patients"
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
        >
          <h3 className="font-bold text-teal-700 text-lg mb-1">
            👥 Mes patients
          </h3>
          <p className="text-sm text-gray-500">
            Accéder aux dossiers
          </p>
        </Link>

        <Link
          to="/doctor/messages"
          className="bg-blue-100 p-6 rounded-2xl hover:shadow-lg transition"
        >
          <h3 className="font-bold text-blue-700 text-lg mb-1">
            💬 Messages
          </h3>
          <p className="text-sm">
            Discuter avec vos patients
          </p>
        </Link>

      </div>

      {/* 🔥 RENDEZ-VOUS */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            Rendez-vous récents
          </h3>

          <Link
            to="/doctor/appointments"
            className="text-sm text-teal-600 font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-3">

            {appointments.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">

                  <img
                    src={app.patient?.avatar || "https://i.pravatar.cc/150"}
                    className="w-12 h-12 rounded-full"
                    alt=""
                  />

                  <div>
                    <p className="font-semibold text-gray-800">
                      {app.patient?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.reason} • {app.date} à {app.time}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
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
            ))}

          </div>
        ) : (
          <p className="text-center text-gray-400">
            Aucun rendez-vous
          </p>
        )}
      </div>

    </div>
  );
};

export default DoctorDashboard;