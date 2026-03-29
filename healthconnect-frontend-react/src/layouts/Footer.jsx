import React from "react";

const Hero = () => {
    return (
        <div>
            {/* ===== FOOTER ===== */}
            <footer className="bg-gradient-to-t from-teal-600 to-gray-50 py-12">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm text-gray-600">

                    <div>
                        <h4 className="font-semibold mb-2">MediConnect</h4>
                        <p className="text-teal-600 font-medium">
                            Votre santé, à distance.
                        </p>
                        <p className="mt-2">
                            Une plateforme dédiée à faciliter l'accès aux soins.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Navigation</h4>
                        <ul className="space-y-1">
                            <li>Accueil</li>
                            <li>Pour les praticiens</li>
                            <li>Blog santé</li>
                            <li>Aide & Support</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Légal</h4>
                        <ul className="space-y-1">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Contact</li>
                            <li>Cookies</li>
                        </ul>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    © 2024 MediConnect. Votre santé, à distance.
                </p>
            </footer>
        </div>
    );
};

export default Hero;