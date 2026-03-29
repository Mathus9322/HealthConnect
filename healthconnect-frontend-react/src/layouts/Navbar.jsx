import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";


const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const location = useLocation(); // <-- pour détecter la route active
  const navigate = useNavigate();


  const getNavLinks = (role) => {
    switch (role) {
      case "admin":
        return [
          { name: "Accueil", path: "/" },
          { name: "Dashboard", path: "/dashboard/admin" },
          { name: "Gestion Médecins", path: "/doctors" },
          { name: "Gestion Patients", path: "/patients" },
        ];
      case "doctor":
        return [
          { name: "Accueil", path: "/" },
          { name: "Dashboard", path: "/dashboard/doctor" },
          { name: "Rendez-vous", path: "/appointments" },
          { name: "Messages", path: "/doctor/messages" },
        ];
      case "patient":
        return [
          { name: "Accueil", path: "/" },
          { name: "Dashboard", path: "/dashboard/patient" },
          { name: "Médecins", path: "/doctors" },
          { name: "Rendez-vous", path: "/appointments" },
          { name: "Forum", path: "/patient/messages" },
        ];
        default:
          return [
          { name: "Accueil", path: "/" },
          { name: "Médecins", path: "/doctors" },
        ];
    }
  };

  const navLinks = getNavLinks(user?.role);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link
            to="/"
            className="text-2xl font-extrabold text-teal-600 tracking-tight"
          >
            HealthConnect
          </Link>
        </div>

        {/* MENU CENTRÉ */}
        <div className="hidden md:flex space-x-8 flex-1 justify-center">

        </div>

        {/* USER / ACTIONS */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition ${isActive(link.path)
                ? "text-teal-600 font-semibold border-b-2 border-teal-600"
                : "text-gray-600 hover:text-teal-600"
                }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Link>

              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-gray-500">{user.role}</span>
              </div>

              <button onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-teal-600 transition"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 bg-white border-t animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block ${isActive(link.path)
                ? "text-teal-600 font-semibold"
                : "text-gray-600"
                }`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/profile" className="block text-teal-600 font-semibold">
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
              </Link>
              <button onClick={handleLogout}
                className="block bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition text-sm"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block">Connexion</Link>
              <Link
                to="/register"
                className="block text-teal-600 font-semibold"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;