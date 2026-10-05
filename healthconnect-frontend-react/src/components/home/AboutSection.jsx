import React from "react";
import { HeartPulse, User, Stethoscope, ShieldCheck } from "lucide-react";


const spaces = [
  {
    icon: User,
    title: "Pour les patients",
    text: "Trouvez un médecin, réservez vos rendez-vous, échangez avec votre praticien et retrouvez vos ordonnances.",
  },
  {
    icon: Stethoscope,
    title: "Pour les médecins",
    text: "Gérez votre agenda, suivez vos patients, répondez à leurs messages et rédigez vos prescriptions.",
  },
  {
    icon: ShieldCheck,
    title: "Pour l'administration",
    text: "Supervisez les utilisateurs, les rendez-vous et l'activité de la plateforme depuis un tableau de bord.",
  },
];


const AboutSection = () => {
  return (
    <section id="apropos" className="bg-white py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 items-center">

        {/* DESCRIPTION */}
        <div className="md:col-span-2">
          <span className="inline-flex items-center gap-2 text-teal-700 bg-teal-50 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
            <HeartPulse size={14} />
            À propos
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
            Qu'est-ce que HealthConnect ?
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            HealthConnect est une plateforme de santé en ligne qui met en relation
            patients et médecins. Elle centralise la prise de rendez-vous, la
            messagerie et les ordonnances pour simplifier le suivi médical.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Plus besoin de multiplier les appels ni de perdre vos documents :
            tout votre parcours de soins est réuni au même endroit, accessible
            à tout moment.
          </p>
        </div>

        {/* ESPACES */}
        <div className="md:col-span-3 grid gap-4">
          {spaces.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:shadow-lg hover:border-teal-100 transition"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
