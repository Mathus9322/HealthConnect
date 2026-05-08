import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  User,
  Users,
  Calendar,
  MessageCircle,
  Menu,
  X,
  LogOut,
  TrendingUp,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinks = (role) => {
    switch (role) {
      case "admin":
        return [
          { name: "Accueil", path: "/", icon: <Home size={20} /> },
          { name: "Dashboard", path: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
          { name: "Statistiques", path: "/admin/stats", icon: <TrendingUp size={20} /> },
          { name: "Utilisateurs", path: "/admin/users", icon: <Users size={20} /> },
          { name: "Rendez-vous", path: "/admin/appointments", icon: <Calendar size={20} /> },
          { name: "Messages", path: "/admin/messages", icon: <MessageCircle size={20} /> },
          { name: "Prescriptions", path: "/admin/prescriptions", icon: <ClipboardList size={20} /> },
        ];
      case "doctor":
        return [
          { name: "Accueil", path: "/", icon: <Home size={20} /> },
          { name: "Dashboard", path: "/dashboard/doctor", icon: <LayoutDashboard size={20} /> },
          { name: "Rendez-vous", path: "/doctor/appointments", icon: <Calendar size={20} /> },
          { name: "Mes patients", path: "/doctor/patients", icon: <Users size={20} /> },
          { name: "Messages", path: "/doctor/messages", icon: <MessageCircle size={20} /> },
          { name: "Prescriptions", path: "/doctor/prescriptions", icon: <ClipboardList size={20} /> },
        ];
      case "patient":
        return [
          { name: "Accueil", path: "/", icon: <Home size={20} /> },
          { name: "Dashboard", path: "/dashboard/patient", icon: <LayoutDashboard size={20} /> },
          { name: "Médecins", path: "/doctors", icon: <Users size={20} /> },
          { name: "Rendez-vous", path: "/patient/appointments", icon: <Calendar size={20} /> },
          { name: "Messages", path: "/patient/messages", icon: <MessageCircle size={20} /> },
          { name: "Ordonnances", path: "/patient/prescriptions", icon: <ClipboardList size={20} /> },
        ];
      default:
        return [
          { name: "Accueil", path: "/", icon: <Home size={20} /> },
          { name: "Médecins", path: "/doctors", icon: <Users size={20} /> },
        ];
    }
  };

  const navLinks = getNavLinks(user?.role);

  const roleLabel = (role) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "doctor": return "Médecin";
      case "patient": return "Patient";
      default: return role;
    }
  };

  const roleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700";
      case "doctor": return "bg-blue-100 text-blue-700";
      case "patient": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-teal-600 text-white p-2 rounded shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={24} />}
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-md z-50
          transition-all duration-300
          ${isOpen ? "w-64" : "w-16"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col justify-between
        `}
      >
        {/* LOGO + TOGGLE */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className="text-xl font-extrabold text-teal-600 tracking-tight truncate">
            {isOpen ? "HealthConnect" : "HC"}
          </Link>
          <button
            className="flex items-center justify-center text-gray-600 hover:bg-gray-100 p-2 rounded-lg"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* ROLE BADGE (sidebar ouverte) */}
        {isOpen && user && (
          <div className="px-4 py-3 border-b">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${roleBadgeColor(user.role)}`}>
              {roleLabel(user.role)}
            </span>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="mt-2 flex-1 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-4 p-3 mx-2 rounded-lg transition-colors group
                ${isActive(link.path)
                  ? "bg-teal-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              {link.icon}
              {isOpen && <span className="font-medium text-sm">{link.name}</span>}
              {!isOpen && (
                <span className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-2
                  bg-teal-400 text-teal-900 border border-teal-500 text-xs rounded py-1 px-2 whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  translate-x-[-10px] group-hover:translate-x-0
                  pointer-events-none
                  transition-all duration-300 ease-out
                ">
                  {link.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* PROFIL + DÉCONNEXION */}
        {user && (
          <div className="flex items-center gap-3 p-4 border-t relative group">
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
            >
              {user.name?.charAt(0).toUpperCase()}
            </Link>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">
                  {user.role === "doctor" ? "Dr. " : ""}{user.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 w-fit ${roleBadgeColor(user.role)}`}>
                  {roleLabel(user.role)}
                </span>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center gap-1 mt-2 text-red-600 hover:text-red-800 text-xs"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            )}
            {!isOpen && (
              <span className="
                absolute left-full top-1/2 -translate-y-1/2 ml-2
                bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap
                opacity-0 group-hover:opacity-100
                translate-x-[-10px] group-hover:translate-x-0
                pointer-events-none
                transition-all duration-300 ease-out
              ">
                {user.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION LOGOUT */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">Confirmer la déconnexion</h2>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Oui, se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
