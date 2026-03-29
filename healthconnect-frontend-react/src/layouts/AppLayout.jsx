import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";   // navbar avant login
import Sidebar from "./Sidebar"; // sidebar après login

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar si connecté */}
      {user && <Sidebar />}

      {/* Contenu principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          user ? "ml-64" : ""
        }`} // ml-64 = largeur sidebar
      >
        {/* Navbar seulement si non connecté */}
        {!user && <Navbar />}

        {/* Main */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;