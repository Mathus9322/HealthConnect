import React from "react";
import api from "../../api/axios";
import { useEffect } from "react";


const Hero = () => {

  const [doctors, setDoctors] = React.useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error("Erreur chargement médecins", error);
      }
    };
    fetchDoctors();
  }, []);

  const mostExperienced = doctors.reduce((max, doc) => {
    return doc.experience > max.experience ? doc : max;
  }, { experience: 0 });
  

  return (
    <section className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">

        {/* TEXTE */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-teal-400 to-teal-600 text-transparent bg-clip-text drop-shadow-md">
              L'EXCELLENCE
            </span>
            <br />
            <span className="text-gray-800">
              clinique simplifiée
            </span>
          </h1>

          <p className="text-gray-600 mb-8">
            Accédez à des soins de qualité où que vous soyez grâce à notre
            plateforme de santé digitale moderne.
          </p>

          <div className="flex gap-4">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg shadow">
              Prendre rendez-vous
            </button>

            <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
              En savoir plus
            </button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54"
            alt="Médecin professionnel"
            className="rounded-2xl shadow-lg"
          />

          {/* CARD FLOTTANTE */}
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-md w-64">
            <p className="text-sm font-semibold mb-1">{mostExperienced.user.name}</p>
            
            <p className="text-xs text-gray-500 mb-2">
              {mostExperienced.specialty} - {mostExperienced.experience} ans d'expérience
            </p>

            <button className="text-teal-600 text-xs font-medium">
              Voir profil →
            </button>
          </div>
        </div>

        {/* MÉDECIN AVEC PLUS D'EXPÉRIENCE */}
        {doctors && doctors.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">Notre expert</h2>
            {Math.max(...doctors.map(doc => doc.experience)) && (
          <div>
            <p className="font-semibold">{mostExperienced.user.name}</p>
            <p className="text-gray-600">{mostExperienced.experience} ans d'expérience</p>
          </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;