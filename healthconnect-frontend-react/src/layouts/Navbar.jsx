import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/notifications/NotificationBell";
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


  // Liens identiques pour tous : visiteurs et utilisateurs connectés en vue publique
  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "À propos", path: "/#apropos" },
    { name: "Contacts", path: "/#contact" },
    { name: "Médecins", path: "/doctors" },
  ];

  const roleLabel = { admin: "Administrateur", doctor: "Médecin", patient: "Patient" };

  const isActive = (path) => {
    const [pathname, hash] = path.split("#");
    return hash
      ? location.pathname === pathname && location.hash === `#${hash}`
      : location.pathname === path && !location.hash;
  };

  // Lien vers une section de l'accueil : défilement direct si on y est déjà
  const handleNavClick = (path) => {
    setOpen(false);
    const [pathname, hash] = path.split("#");
    if (hash && location.pathname === pathname) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/" && location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderNavLinks = (mobile = false) =>
    navLinks.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        onClick={() => handleNavClick(link.path)}
        className={mobile
          ? `block ${isActive(link.path) ? "text-teal-600 font-semibold" : "text-gray-600"}`
          : `relative py-1 text-sm font-medium transition after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-teal-600 after:transition-all ${isActive(link.path)
            ? "text-teal-600 after:w-full"
            : "text-gray-600 hover:text-teal-600 after:w-0 hover:after:w-full"
            }`}
      >
        {link.name}
      </Link>
    ));

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div className="flex-1">
          <Link
            to="/"
            onClick={() => handleNavClick("/")}
            className="text-2xl font-extrabold text-teal-600 tracking-tight"
          >
            HealthConnect
          </Link>
        </div>

        {/* MENU CENTRÉ */}
        <div className="hidden md:flex items-center gap-8">
          {renderNavLinks()}
        </div>

        {/* USER / ACTIONS */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Link
                to={`/dashboard/${user.role}`}
                className="inline-flex items-center gap-2 text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md shadow-teal-600/20 hover:bg-teal-700 transition"
              >
                <LayoutDashboard size={16} />
                Tableau de bord
              </Link>

              <NotificationBell />

              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Link>

              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-gray-500">{roleLabel[user.role] || user.role}</span>
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
                className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:text-teal-600 hover:bg-teal-50 transition"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-teal-600 text-white px-5 py-2 rounded-lg shadow-md shadow-teal-600/20 hover:bg-teal-700 transition"
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
          {renderNavLinks(true)}

          {user ? (
            <>
              <Link to={`/dashboard/${user.role}`} className="block text-teal-600 font-semibold">
                Tableau de bord
              </Link>
              <Link to="/profile" className="block text-teal-600 font-semibold">
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">{roleLabel[user.role] || user.role}</span>
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