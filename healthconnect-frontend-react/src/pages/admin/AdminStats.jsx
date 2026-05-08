import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  TrendingUp,
  Users,
  Calendar,
  MessageCircle,
  ClipboardList,
  UserCheck,
  AlertCircle,
  Activity,
} from "lucide-react";

const StatCard = ({ label, value, icon, colorClass, sub }) => (
  <div className={`bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border-l-4 ${colorClass}`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>{icon}</div>
      <TrendingUp size={16} className="text-gray-300" />
    </div>
    <h2 className="text-3xl font-bold text-gray-800">{value ?? "—"}</h2>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={40} />
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-2">Vérifiez que la route <code>/admin/stats</code> existe côté backend.</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Utilisateurs",
      value: stats?.totalUsers,
      icon: <Users size={22} className="text-teal-600" />,
      colorClass: "border-teal-500",
      sub: `${stats?.totalDoctors ?? 0} médecins · ${stats?.totalPatients ?? 0} patients`,
    },
    {
      label: "Médecins",
      value: stats?.totalDoctors,
      icon: <UserCheck size={22} className="text-blue-600" />,
      colorClass: "border-blue-500",
    },
    {
      label: "Patients",
      value: stats?.totalPatients,
      icon: <Users size={22} className="text-purple-600" />,
      colorClass: "border-purple-500",
    },
    {
      label: "Total Rendez-vous",
      value: stats?.totalAppointments,
      icon: <Calendar size={22} className="text-orange-500" />,
      colorClass: "border-orange-500",
      sub: `${stats?.pendingAppointments ?? 0} en attente`,
    },
    {
      label: "Rendez-vous confirmés",
      value: stats?.acceptedAppointments,
      icon: <Activity size={22} className="text-green-600" />,
      colorClass: "border-green-500",
    },
    {
      label: "Rendez-vous terminés",
      value: stats?.completedAppointments,
      icon: <Activity size={22} className="text-teal-600" />,
      colorClass: "border-teal-400",
    },
    {
      label: "Messages échangés",
      value: stats?.totalMessages,
      icon: <MessageCircle size={22} className="text-indigo-600" />,
      colorClass: "border-indigo-500",
    },
    {
      label: "Prescriptions émises",
      value: stats?.totalPrescriptions,
      icon: <ClipboardList size={22} className="text-red-600" />,
      colorClass: "border-red-500",
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-teal-600" /> Statistiques globales
        </h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme HealthConnect</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* APPOINTMENTS BREAKDOWN */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Répartition des rendez-vous</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "En attente", value: stats?.pendingAppointments ?? 0, color: "bg-yellow-100 text-yellow-700" },
            { label: "Confirmés", value: stats?.acceptedAppointments ?? 0, color: "bg-blue-100 text-blue-700" },
            { label: "Terminés", value: stats?.completedAppointments ?? 0, color: "bg-teal-100 text-teal-700" },
            { label: "Refusés", value: stats?.rejectedAppointments ?? 0, color: "bg-red-100 text-red-700" },
          ].map((item) => (
            <div key={item.label} className={`p-5 rounded-2xl text-center ${item.color}`}>
              <h3 className="text-3xl font-bold">{item.value}</h3>
              <p className="text-sm font-medium mt-1">{item.label}</p>
              {stats?.totalAppointments > 0 && (
                <p className="text-xs opacity-70 mt-1">
                  {Math.round((item.value / stats.totalAppointments) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        {stats?.totalAppointments > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-2">Répartition visuelle</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {[
                { value: stats?.pendingAppointments ?? 0, color: "bg-yellow-400" },
                { value: stats?.acceptedAppointments ?? 0, color: "bg-blue-400" },
                { value: stats?.completedAppointments ?? 0, color: "bg-teal-400" },
                { value: stats?.rejectedAppointments ?? 0, color: "bg-red-400" },
              ].map((seg, i) => (
                <div
                  key={i}
                  className={`${seg.color} transition-all`}
                  style={{ width: `${(seg.value / stats.totalAppointments) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* USERS BREAKDOWN */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Répartition des utilisateurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Admins", value: stats?.totalAdmins ?? 0, color: "bg-purple-100 text-purple-700" },
            { label: "Médecins", value: stats?.totalDoctors ?? 0, color: "bg-blue-100 text-blue-700" },
            { label: "Patients", value: stats?.totalPatients ?? 0, color: "bg-teal-100 text-teal-700" },
          ].map((item) => (
            <div key={item.label} className={`p-5 rounded-2xl text-center ${item.color}`}>
              <h3 className="text-3xl font-bold">{item.value}</h3>
              <p className="text-sm font-medium mt-1">{item.label}</p>
              {stats?.totalUsers > 0 && (
                <p className="text-xs opacity-70 mt-1">
                  {Math.round((item.value / stats.totalUsers) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
