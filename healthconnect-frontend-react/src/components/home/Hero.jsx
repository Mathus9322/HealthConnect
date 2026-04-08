import React from "react";
import api from "../../api/axios";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";


const Hero = () => {

  const [doctors, setDoctors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error("Erreur chargement médecins", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const mostExperienced = doctors.reduce((max, doc) => {
    return doc.experience > max.experience ? doc : max;
  }, { experience: 0 });

    /* ─── loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement ...</p>
        </div>
      </div>
    );
  }
  

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
            <Link to={"/patient/appointments"} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg shadow">
              Prendre rendez-vous
            </Link>

            <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
              En savoir plus
            </button>
          </div>
        </div>

        {/* MÉDECIN AVEC PLUS D'EXPÉRIENCE */}

        <div className="relative">
          <img
            src={mostExperienced.avatar || "https://images.unsplash.com/photo-1582750433449-648ed127bb54"}
            alt="Médecin professionnel"
            className="rounded-2xl shadow-lg object-cover w-full h-96"
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

      </div>
    </section>
  );
};

export default Hero;