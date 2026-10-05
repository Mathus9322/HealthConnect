import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";


const CallToAction = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-700 text-white text-center px-8 py-14 md:py-16 rounded-[2rem] shadow-2xl shadow-teal-700/30">

          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-white/10 rounded-full" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à simplifier votre parcours de santé ?
            </h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Créez votre compte gratuitement et prenez votre premier rendez-vous dès aujourd'hui.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-white text-teal-700 px-7 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
              >
                Créer mon compte
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-xl font-medium hover:bg-white/10 transition"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CallToAction;
