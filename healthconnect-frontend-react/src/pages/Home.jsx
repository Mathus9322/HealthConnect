// src/pages/Home.jsx
import React from "react";
import Hero from "../components/home/Hero";
import ServicesSection from "../components/home/ServicesSection";

const Home = () => {
  return (
    <div>
      

      {/* HERO SECTION */}
      <Hero />

      {/* SERVICES */}
      <ServicesSection />

    </div>
  );
};

export default Home;