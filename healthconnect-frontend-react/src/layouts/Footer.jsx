import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT } from "../components/home/ContactSection";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400">
            <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-sm">

                <div className="md:col-span-2">
                    <Link to="/" className="inline-flex items-center gap-2 text-white text-xl font-extrabold">
                        <HeartPulse className="text-teal-400" size={22} />
                        HealthConnect
                    </Link>
                    <p className="mt-4 max-w-sm leading-relaxed">
                        La plateforme qui rapproche patients et médecins : rendez-vous,
                        messagerie et ordonnances réunis au même endroit.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold text-white mb-4">Navigation</h4>
                    <ul className="space-y-2">
                        <li><Link to="/" className="hover:text-teal-400 transition">Accueil</Link></li>
                        <li><Link to="/#apropos" className="hover:text-teal-400 transition">À propos</Link></li>
                        <li><Link to="/#contact" className="hover:text-teal-400 transition">Contacts</Link></li>
                        <li><Link to="/doctors" className="hover:text-teal-400 transition">Médecins</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-white mb-4">Contact</h4>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2"><Mail size={14} /> {CONTACT.email}</li>
                        <li className="flex items-center gap-2"><Phone size={14} /> {CONTACT.phone}</li>
                        <li className="flex items-center gap-2"><MapPin size={14} /> {CONTACT.address}</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <p className="max-w-6xl mx-auto px-6 py-5 text-xs text-gray-500">
                    © {new Date().getFullYear()} HealthConnect. Tous droits réservés.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
