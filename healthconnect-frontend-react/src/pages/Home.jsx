// src/pages/Home.jsx
import React from "react";
import Hero from "../components/home/Hero";
import ServicesSection from "../components/home/ServicesSection";
import Footer from "../layouts/Footer";


const Home = () => {
  return (
    <div>
      

      {/* HERO SECTION */}
      <Hero />

      {/* SERVICES */}
      <ServicesSection />



        <Footer />

    </div>
  );
};

export default Home;