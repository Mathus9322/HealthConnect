import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, Calendar, MessageCircle, TrendingUp, Activity, ClipboardList, AlertCircle, ShieldCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalMessages: 0,
    totalPrescriptions: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/appointments?per_page=5"),
        ]);
        setStats(statsRes.data);
        setRecentAppointments(
          appointmentsRes.data.data || appointmentsRes.data || []
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
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
          <p className="text-gray-400 text-sm mt-2">
            Vérifiez que les routes API admin sont bien configurées.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Utilisateurs",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: "teal",
      link: "/admin/users",
    },
    {
      label: "Médecins",
      value: stats.totalDoctors,
      icon: <UserCheck size={24} />,
      color: "blue",
      link: "/admin/users?role=doctor",
    },
    {
      label: "Patients",
      value: stats.totalPatients,
      icon: <Users size={24} />,
      color: "purple",
      link: "/admin/users?role=patient",
    },
    {
      label: "Rendez-vous",
      value: stats.totalAppointments,
      icon: <Calendar size={24} />,
      color: "orange",
      link: "/admin/appointments",
    },
    {
      label: "En attente",
      value: stats.pendingAppointments,
      icon: <Activity size={24} />,
      color: "yellow",
      link: "/admin/appointments?status=pending",
    },
    {
      label: "Messages",
      value: stats.totalMessages,
      icon: <MessageCircle size={24} />,
      color: "green",
      link: "/admin/messages",
    },
    {
      label: "Prescriptions",
      value: stats.totalPrescriptions,
      icon: <ClipboardList size={24} />,
      color: "red",
      link: "/admin/prescriptions",
    },
  ];

  const colorMap = {
    teal: "border-teal-500 text-teal-600 bg-teal-50",
    blue: "border-blue-500 text-blue-600 bg-blue-50",
    purple: "border-purple-500 text-purple-600 bg-purple-50",
    orange: "border-orange-500 text-orange-600 bg-orange-50",
    yellow: "border-yellow-500 text-yellow-600 bg-yellow-50",
    green: "border-green-500 text-green-600 bg-green-50",
    red: "border-red-500 text-red-600 bg-red-50",
  };

  const statusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "accepted": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "completed": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "pending": return "En attente";
      case "accepted": return "Confirmé";
      case "rejected": return "Refusé";
      case "completed": return "Terminé";
      default: return status;
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-lg mb-10">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold shadow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bonjour, {user?.name}
            </h1>
            <p className="text-teal-100 text-sm">{user?.email}</p>
            <span className="mt-2 inline-block bg-white/20 px-3 py-1 text-xs rounded-full font-semibold">
              <ShieldCheck size={14} className="inline-block align-[-2px] mr-1" />Administrateur
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            to="/admin/users"
            className="bg-white text-teal-700 px-5 py-2 rounded-xl font-medium shadow hover:scale-105 transition"
          >
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`bg-white p-5 rounded-2xl shadow hover:shadow-lg transition border-l-4 ${colorMap[card.color]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${colorMap[card.color]}`}>
                {card.icon}
              </div>
              <TrendingUp size={16} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Utilisateurs", icon: Users, path: "/admin/users", bg: "from-teal-600 to-teal-500", text: "white" },
          { label: "Rendez-vous", icon: Calendar, path: "/admin/appointments", bg: "from-blue-600 to-blue-500", text: "white" },
          { label: "Messages", icon: MessageCircle, path: "/admin/messages", bg: "from-purple-600 to-purple-500", text: "white" },
          { label: "Prescriptions", icon: ClipboardList, path: "/admin/prescriptions", bg: "from-orange-500 to-orange-400", text: "white" },
        ].map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`flex items-center gap-2 bg-gradient-to-r ${action.bg} text-${action.text} p-5 rounded-2xl shadow hover:scale-105 transition font-semibold text-sm`}
          >
            <action.icon size={18} />
            {action.label}
          </Link>
        ))}
      </div>

      {/* RECENT APPOINTMENTS */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Rendez-vous récents</h3>
          <Link to="/admin/appointments" className="text-sm text-teal-600 font-medium hover:underline">
            Voir tout →
          </Link>
        </div>

        {recentAppointments.length > 0 ? (
          <div className="space-y-3">
            {recentAppointments.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={app.patient?.avatar || "https://i.pravatar.cc/150?u=" + app.patient?.id}
                    className="w-10 h-10 rounded-full"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {app.patient?.name} → Dr. {app.doctor?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.reason} • {app.date} à {app.time}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle(app.status)}`}>
                  {statusLabel(app.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6">Aucun rendez-vous récent</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
