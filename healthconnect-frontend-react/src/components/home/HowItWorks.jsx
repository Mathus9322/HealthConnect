import React from "react";
import { UserPlus, Search, CalendarCheck } from "lucide-react";


const steps = [
  {
    icon: UserPlus,
    title: "Créez votre compte",
    text: "Inscrivez-vous gratuitement en moins d'une minute.",
  },
  {
    icon: Search,
    title: "Choisissez un médecin",
    text: "Comparez les spécialités, l'expérience et les disponibilités.",
  },
  {
    icon: CalendarCheck,
    title: "Réservez votre créneau",
    text: "Confirmez votre rendez-vous et suivez-le depuis votre espace.",
  },
];


const HowItWorks = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Votre rendez-vous en 3 étapes
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-10">

          {/* LIGNE DE LIAISON */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200" />

          {steps.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="relative text-center">
              <div className="relative mx-auto w-20 h-20 rounded-2xl bg-white border-2 border-teal-100 shadow-lg flex items-center justify-center text-teal-600 mb-6">
                <Icon size={30} />
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center shadow">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
