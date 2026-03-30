// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if(loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-teal-600" size={32} />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }
  // if (!user) return <Navigate to="/login" />; // Pas connecté

  if (roles && !roles.includes(user.role)) {
    // Redirige si le rôle n’est pas autorisé
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;