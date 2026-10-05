// DashboardLayout.jsx — espaces connectés (admin, médecin, patient) : sidebar + contenu
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "./Sidebar";
import NotificationBell from "../components/notifications/NotificationBell";

const DashboardLayout = ({ roles }) => {
  // Gérer l'état ouvert/fermé du sidebar pour ajuster le contenu
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute roles={roles}>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          }`} // ml-64 = sidebar ouverte, ml-16 = sidebar réduite
        >
          {/* BARRE DU HAUT : notifications */}
          <header className="sticky top-0 z-30 h-14 flex items-center justify-end gap-2 px-4 md:px-6 bg-gray-100/80 backdrop-blur border-b border-gray-200/70">
            <NotificationBell />
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
