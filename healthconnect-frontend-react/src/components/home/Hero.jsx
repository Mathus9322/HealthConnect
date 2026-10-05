import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  MessageCircle,
  Star,
  Clock,
} from "lucide-react";


const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


const Hero = ({ doctors = [], loading = false }) => {

  const mostExperienced = doctors.reduce((max, doc) => {
    return doc.experience > max.experience ? doc : max;
  }, { experience: 0 });

  const specialties = new Set(doctors.map((doc) => doc.specialty).filter(Boolean));

  const stats = [
    { value: loading ? "…" : doctors.length, label: "Médecins disponibles" },
    { value: loading ? "…" : specialties.size, label: "Spécialités" },
    { value: "24/7", label: "Prise de RDV en ligne" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">

      {/* FORMES DÉCORATIVES */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-300/40 rounded-full blur-3xl animate-blob -z-10" />
      <div className="absolute top-40 -right-24 w-96 h-96 bg-cyan-300/40 rounded-full blur-3xl animate-blob [animation-delay:4s] -z-10" />

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 grid md:grid-cols-2 gap-14 items-center">

        {/* TEXTE */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 bg-white/80 border border-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Votre santé, connectée
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-gray-900">
            Prenez soin de vous,{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-transparent bg-clip-text">
              sans attendre
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Trouvez un médecin, réservez une consultation en quelques clics et
            échangez avec votre praticien, le tout depuis une seule plateforme.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/patient/appointments"
              className="group inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-xl font-medium shadow-lg shadow-teal-600/30 transition"
            >
              <CalendarCheck size={18} />
              Prendre rendez-vous
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-medium hover:border-teal-300 hover:text-teal-700 transition"
            >
              <Stethoscope size={18} />
              Voir les médecins
            </Link>
          </div>

          {/* STATS */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VISUEL */}
        <div className="relative animate-fade-up [animation-delay:200ms]">

          <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[2rem] p-8 shadow-2xl shadow-teal-700/30">

            {/* CARTE RENDEZ-VOUS */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-gray-800">Prochain rendez-vous</p>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                  Confirmé
                </span>
              </div>

              {mostExperienced.user ? (
                <div className="flex items-center gap-4">
                  {mostExperienced.user.avatar ? (
                    <img
                      src={mostExperienced.user.avatar}
                      alt={mostExperienced.user.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center font-bold">
                      {getInitials(mostExperienced.user.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">Dr. {mostExperienced.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {mostExperienced.specialty} · {mostExperienced.experience} ans d'expérience
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Votre médecin</p>
                    <p className="text-sm text-gray-500">Choisissez parmi nos praticiens</p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2">
                {["09:00", "10:30", "14:00"].map((slot, i) => (
                  <div
                    key={slot}
                    className={`text-center text-sm py-2 rounded-lg border ${
                      i === 1
                        ? "bg-teal-600 border-teal-600 text-white font-medium"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {/* CARTE MESSAGE */}
            <div className="mt-5 bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4 text-white flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">Nouveau message</p>
                <p className="text-xs text-white/80">
                  « Votre ordonnance est disponible dans votre espace. »
                </p>
              </div>
            </div>
          </div>

          {/* BADGES FLOTTANTS */}
          <div className="hidden sm:flex absolute -top-5 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 items-center gap-2 animate-float">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <div>
              <p className="text-sm font-bold text-gray-900">Réservation en ligne</p>
              <p className="text-[11px] text-gray-500">Sans appel téléphonique</p>
            </div>
          </div>

          <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-4 py-3 items-center gap-3 animate-float [animation-delay:2s]">
            <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Données protégées</p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Clock size={11} /> Accès sécurisé 24h/24
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
