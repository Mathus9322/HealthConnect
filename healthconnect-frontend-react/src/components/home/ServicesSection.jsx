import React from "react";
import { Video, Calendar, Shield, CheckCircle } from "lucide-react";

const ServicesSection = () => {
  return (
    <div className="bg-gradient-to-l from-teal-100 to-teal-600 py-16">
      
      {/* ===== SERVICES ===== */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-2xl font-semibold mb-10">
          Nos Services de Santé
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="bg-teal-600 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <Video className="text-white" size={20} />
            </div>
            <h3 className="font-semibold mb-2">Téléconsultations</h3>
            <p className="text-gray-600 text-sm mb-4">
              Consultez votre médecin où que vous soyez via notre plateforme vidéo.
            </p>
            <button className="text-teal-600 text-sm font-medium">
              Découvrir →
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="bg-teal-600 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <Calendar className="text-white" size={20} />
            </div>
            <h3 className="font-semibold mb-2">Prise de RDV simplifiée</h3>
            <p className="text-gray-600 text-sm mb-4">
              Réservez vos créneaux en quelques clics avec des praticiens certifiés.
            </p>
            <button className="text-teal-600 text-sm font-medium">
              Prendre rendez-vous →
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="bg-teal-600 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <Shield className="text-white" size={20} />
            </div>
            <h3 className="font-semibold mb-2">Dossiers sécurisés</h3>
            <p className="text-gray-600 text-sm mb-4">
              Vos données médicales sont chiffrées et protégées.
            </p>
            <button className="text-teal-600 text-sm font-medium">
              Accéder à mon dossier →
            </button>
          </div>
        </div>
      </div>

      {/* ===== SECURITY SECTION ===== */}
      <div className="max-w-6xl mx-auto px-6 mt-20 grid md:grid-cols-2 gap-10 items-center">
        
        {/* IMAGE */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118"
            alt="health tech"
            className="rounded-2xl shadow-md"
          />

          {/* Badge */}
          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
            <p className="font-bold">100%</p>
            <p>Protection des données</p>
          </div>
        </div>

        {/* TEXT */}
        <div>
          <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">
            Technologies & sécurité
          </span>

          <h3 className="text-2xl font-semibold mt-4 mb-4">
            La sécurité de vos données est notre priorité absolue
          </h3>

          <div className="space-y-4 text-gray-600 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle className="text-teal-600" size={18} />
              Hébergement de données de santé (HDS)
            </p>

            <p className="flex items-start gap-2">
              <CheckCircle className="text-teal-600" size={18} />
              Accès instantané à vos documents
            </p>

            <p className="flex items-start gap-2">
              <CheckCircle className="text-teal-600" size={18} />
              Chiffrement de bout en bout
            </p>
          </div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="bg-teal-700 text-white text-center p-10 rounded-3xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2">
            Prêt à simplifier votre parcours de santé ?
          </h3>
          <p className="text-sm mb-6 opacity-90">
            Rejoignez des milliers de patients qui nous font confiance.
          </p>

          <button className="bg-white text-teal-700 px-6 py-3 rounded-full font-medium">
            Commencer l’aventure gratuitement
          </button>
        </div>
      </div>

 
    </div>
  );
};

export default ServicesSection;
