import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const PatientDashboard = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);

        const res = await api.get("/appointments", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(res.data);

        // ✔ sécurisation
        if (Array.isArray(res.data)) {
          setAppointments(res.data);
        } else if (res.data.data) {
          setAppointments(res.data.data);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error(error);
        setErrorAppointments("Erreur : " + error.response?.data?.message || error.message);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [token]);

  if (loadingAppointments) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Chargement des rendez-vous...</p>
      </div>
    );
  }
  


  if (errorAppointments) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 font-medium">{errorAppointments}</p>
      </div>
    );
  }

  const records = [
    {
      id: 1,
      title: "Rapport de Radiologie",
      type: "PDF",
      size: "2.4 MB",
      date: "05 Oct 2023",
    },
    {
      id: 2,
      title: "Ordonnance Pharmacie",
      type: "DOC",
      size: "1.1 MB",
      date: "22 Sep 2023",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* 🔥 HEADER + PROFIL */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* INFOS USER */}
        <div className="flex items-center gap-6">
          <img
            src={
              user?.avatar ||
              "https://i.pravatar.cc/150"
            }
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow"
          />

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Bonjour, {user?.name} 👋
            </h1>

            <p className="text-gray-500">
              {user?.email}
            </p>

            <span className="inline-block mt-2 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full font-semibold">
              Patient
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
            🔔
          </button>

          <Link
            to="/profile"
            className="bg-teal-600 text-white px-5 py-2 rounded-lg shadow hover:bg-teal-700"
          >
            Voir profil
          </Link>
        </div>
      </div>

      {/* ACTIONS RAPIDES */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/doctors"
          className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          <h3 className="text-lg font-bold mb-1">
            Trouver un médecin
          </h3>
          <p className="text-sm opacity-90">
            Prenez rendez-vous facilement
          </p>
        </Link>

        <Link
          to="/appointments"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
        >
          <h3 className="font-bold text-teal-700 mb-1">
            Mes rendez-vous
          </h3>
          <p className="text-sm text-gray-500">
            Gérer vos consultations
          </p>
        </Link>

        <Link
          to="/patient/messages"
          className="bg-blue-100 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          <h3 className="font-bold text-blue-700 mb-1">
            Messages
          </h3>
          <p className="text-sm text-gray-600">
            Voir vos discussions
          </p>
        </Link>
      </div>

      {/* RENDEZ-VOUS */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-bold text-teal-700">
            Prochains Rendez-vous
          </h3>
        </div>

        {Array.isArray(appointments) && appointments.length > 0 ? (
          appointments.map((app) => (
            <div
              key={app.id}
              className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg mb-3 border-l-4 border-teal-500"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={
                    app.doctor?.avatar ||
                    "https://i.pravatar.cc/150"
                  }
                  alt={app.doctor?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{app.doctor?.name}</h4>
                  <p className="text-xs text-gray-600 mb-1">{app.doctor?.specialty}</p>
                  <p className="text-sm text-gray-500">
                    {app.reason} • {app.date} à {app.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 text-right">
                  <p className="font-semibold text-teal-700">{app.doctor?.rating || "N/A"} ⭐</p>
                  <p className="text-gray-500">{app.doctor?.experience || "N/A"}</p>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${app.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : app.status === "accepted"
                    ? "bg-blue-100 text-blue-700"
                    : app.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-teal-100 text-teal-700"
                    }`}
                >
                  {app.status === "pending" ? "En attente" : app.status === "accepted" ? "Confirmé" : app.status === "rejected" ? "Refusé" : "Terminé"}
                </span>
              </div>
            </div>
          ))) : (
          <p className="text-gray-500 text-center">
            Aucun rendez-vous
          </p>
        )}
      </div>

      {/* 🔥 STATS SANTÉ */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Rythme cardiaque</p>
          <h2 className="text-3xl font-bold">72 BPM</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-teal-500">
          <p className="text-sm text-gray-500">Pression</p>
          <h2 className="text-3xl font-bold">120/80</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Sommeil</p>
          <h2 className="text-3xl font-bold">7.5h</h2>
        </div>
      </div>

      {/* 🔥 DOSSIERS */}
      <div>
        <h3 className="text-2xl font-bold text-teal-700 mb-6">
          Dossiers médicaux
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-6 rounded-xl shadow hover:bg-teal-600 hover:text-white transition cursor-pointer"
            >
              <h4 className="font-bold mb-2">{rec.title}</h4>
              <p className="text-sm mb-3">
                {rec.type} • {rec.size}
              </p>
              <p className="text-xs opacity-70">
                {rec.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;