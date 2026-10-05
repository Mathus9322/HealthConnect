import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User } from "lucide-react";

const Register = () => {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation,
      });

      
      login(res.data.user, res.data.token);
      navigate(`/dashboard/${res.data.user.role}`);
    } catch (err) {
      console.log(err.response);
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-md">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Inscription
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="mb-4 flex items-center border rounded-lg px-3">
            <User className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4 flex items-center border rounded-lg px-3">
            <Mail className="text-gray-400 mr-2" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4 flex items-center border rounded-lg px-3">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 outline-none"
            />
          </div>

          {/* CONFIRM */}
          <div className="mb-6 flex items-center border rounded-lg px-3">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full py-2 outline-none"
            />
          </div>

          <button className="w-full bg-teal-600 text-white py-2 rounded-full">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;