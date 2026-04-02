// AppLayout.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  // Gérer l'état ouvert/fermé du sidebar pour ajuster le contenu
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar si connecté */}
      {user && (
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Contenu principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          user ? (sidebarOpen ? "ml-64" : "ml-16") : ""
        }`} // ml-64 = sidebar ouverte, ml-16 = sidebar réduite
      >
        {/* Navbar seulement si non connecté */}
        {!user && <Navbar />}

        {/* Main */}
        <main className="flex-1 p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;