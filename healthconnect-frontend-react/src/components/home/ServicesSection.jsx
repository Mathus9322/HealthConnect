import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MessageCircle,
  FileText,
  Stethoscope,
  CheckCircle,
  Lock,
  ArrowRight,
} from "lucide-react";


const services = [
  {
    icon: Calendar,
    title: "Prise de RDV simplifiée",
    text: "Consultez les disponibilités et réservez votre créneau en quelques clics.",
    link: "/patient/appointments",
    cta: "Prendre rendez-vous",
  },
  {
    icon: MessageCircle,
    title: "Messagerie médecin",
    text: "Posez vos questions et échangez directement avec votre praticien.",
    link: "/patient/messages",
    cta: "Envoyer un message",
  },
  {
    icon: FileText,
    title: "Ordonnances en ligne",
    text: "Retrouvez toutes vos prescriptions au même endroit, à tout moment.",
    link: "/patient/prescriptions",
    cta: "Voir mes ordonnances",
  },
  {
    icon: Stethoscope,
    title: "Médecins qualifiés",
    text: "Parcourez les profils, spécialités et années d'expérience de nos praticiens.",
    link: "/doctors",
    cta: "Découvrir les médecins",
  },
];


const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-20">

      {/* ===== SERVICES ===== */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">
            Nos services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Tout votre parcours de santé, réuni
          </h2>
          <p className="text-gray-600">
            Des outils pensés pour vous faire gagner du temps et rester en lien avec vos médecins.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, text, link, cta }) => (
            <div
              key={title}
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              <div className="bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-5 transition">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">{text}</p>
              <Link
                to={link}
                className="inline-flex items-center gap-1 text-teal-600 text-sm font-medium"
              >
                {cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SÉCURITÉ ===== */}
      <div className="max-w-6xl mx-auto px-6 mt-24 grid md:grid-cols-2 gap-12 items-center">

        {/* VISUEL */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-gray-900 via-teal-900 to-teal-700 p-10 flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute w-52 h-52 rounded-full border border-white/15" />
            <div className="absolute w-32 h-32 rounded-full bg-teal-400/20 blur-xl" />
            <div className="relative bg-white/10 backdrop-blur border border-white/20 w-24 h-24 rounded-3xl flex items-center justify-center text-white">
              <Lock size={40} />
            </div>
          </div>

          <div className="absolute -bottom-5 right-6 bg-white px-5 py-3 rounded-2xl shadow-xl text-sm">
            <p className="font-bold text-gray-900">Accès protégé</p>
            <p className="text-gray-500 text-xs">Connexion par compte personnel</p>
          </div>
        </div>

        {/* TEXTE */}
        <div>
          <span className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
            Confidentialité
          </span>

          <h3 className="text-3xl font-bold text-gray-900 mt-4 mb-6">
            Vos données de santé restent entre vous et votre médecin
          </h3>

          <div className="space-y-4 text-gray-600">
            {[
              "Espaces séparés pour patients, médecins et administrateurs",
              "Accès à vos rendez-vous et ordonnances réservé à votre compte",
              "Échanges privés avec vos praticiens",
            ].map((item) => (
              <p key={item} className="flex items-start gap-3">
                <CheckCircle className="text-teal-600 shrink-0 mt-0.5" size={20} />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default ServicesSection;
