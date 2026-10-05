// PublicLayout.jsx — pages publiques : navbar + contenu + footer
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Pages publiques affichées sans footer
const PAGES_WITHOUT_FOOTER = ["/doctors"];

const PublicLayout = () => {
  const location = useLocation();
  const showFooter = !PAGES_WITHOUT_FOOTER.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default PublicLayout;
