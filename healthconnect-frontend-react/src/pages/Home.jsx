// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import Hero from "../components/home/Hero";
import AboutSection from "../components/home/AboutSection";
import ServicesSection from "../components/home/ServicesSection";
import HowItWorks from "../components/home/HowItWorks";
import FeaturedDoctors from "../components/home/FeaturedDoctors";
import CallToAction from "../components/home/CallToAction";
import ContactSection from "../components/home/ContactSection";


const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erreur chargement médecins", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Arrivée depuis une autre page avec une ancre (/#apropos, /#contact)
  useEffect(() => {
    if (!location.hash) return;
    const timer = setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="overflow-x-hidden">

      {/* HERO SECTION */}
      <Hero doctors={doctors} loading={loading} />

      {/* À PROPOS */}
      <AboutSection />

      {/* SERVICES */}
      <ServicesSection />

      {/* COMMENT ÇA MARCHE */}
      <HowItWorks />

      {/* MÉDECINS */}
      <FeaturedDoctors doctors={doctors} loading={loading} />

      {/* CTA */}
      <CallToAction />

      {/* CONTACT */}
      <ContactSection />


    </div>
  );
};

export default Home;
