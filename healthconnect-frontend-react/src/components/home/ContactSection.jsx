import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";


// Coordonnées affichées sur la page d'accueil (à remplacer par les vraies)
export const CONTACT = {
  email: "contact@healthconnect.sn",
  phone: "+221 33 000 00 00",
  address: "Thiès, Sénégal",
};


const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Pas d'endpoint de contact côté API : on ouvre le client mail de l'utilisateur
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact HealthConnect - ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  };

  const infos = [
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: Phone, label: "Téléphone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Adresse", value: CONTACT.address },
  ];

  return (
    <section id="contact" className="bg-gray-50 py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">

        {/* INFOS */}
        <div>
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">
            Contacts
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Une question ? Écrivez-nous
          </h2>
          <p className="text-gray-600 mb-10">
            Notre équipe vous répond pour toute question sur la plateforme,
            votre compte ou vos rendez-vous.
          </p>

          <div className="space-y-5">
            {infos.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm text-teal-600 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  {href ? (
                    <a href={href} className="font-medium text-gray-900 hover:text-teal-600 transition">
                      {value}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-900">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                id="contact-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition resize-none"
              placeholder="Comment pouvons-nous vous aider ?"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-teal-600/30 transition"
          >
            <Send size={16} />
            Envoyer le message
          </button>
        </form>

      </div>
    </section>
  );
};

export default ContactSection;
