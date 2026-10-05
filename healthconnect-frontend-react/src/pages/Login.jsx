import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Hospital, Eye, EyeOff } from "lucide-react";

const Login = () => {

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Appel login API
      const res = await api.post("/login", form);

      const token = res.data.token;
      const user = res.data.user;

      // Sauvegarde dans AuthContext
      login(user, token);

      // Redirection selon rôle
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError("Erreur du serveur. Réessayez plus tard.");
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex flex-1 items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-teal-200/30 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* LEFT SIDE */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-gray-100">
            <div>
              <div className="flex items-center gap-3 mb-16">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-700 to-teal-500 rounded-xl flex items-center justify-center text-white">
                  <Hospital size={22} />
                </div>
                <span className="text-2xl font-bold text-teal-700">HealthConnect</span>
              </div>
              <h2 className="text-4xl font-extrabold mb-6">L'excellence clinique,<br />simplifiée.</h2>
              <p className="text-gray-600 mb-8">
                Accédez à votre espace sécurisé pour gérer vos rendez-vous et vos dossiers médicaux.
              </p>
            </div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Votre santé, à distance</p>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-8 md:p-16 flex flex-col justify-center relative z-10">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Connexion</h1>
                <p className="text-gray-500">Ravi de vous revoir sur HealthConnect</p>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}
                <div>
                  <label className="block text-sm mb-2">Adresse e-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nom@exemple.com"
                    className="w-full px-5 py-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm">Mot de passe</label>
                    <span className="text-xs text-teal-600 cursor-pointer">Mot de passe oublié ?</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-5 py-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                </div>

                {/* REMEMBER */}
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"

                  className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white py-4 rounded-full font-bold text-lg hover:scale-105 transition"
                >
                  Se connecter
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-gray-500 text-sm">
                  Pas encore de compte ?
                  <Link to="/register" className="text-teal-600 font-bold ml-1">S'inscrire</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;