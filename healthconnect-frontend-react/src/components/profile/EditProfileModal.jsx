import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { X } from "lucide-react";

const EditProfileModal = ({ onClose }) => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      // 🔥 Ne pas envoyer password s’il est vide
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim() !== "") {
        payload.password = form.password;
      }

      const res = await api.put("/profile", payload);

      // 🔥 Mise à jour du user dans le context
      login(res.data, localStorage.getItem("token"));

      setSuccess("Profil mis à jour avec succès ✅");

      // fermeture après 1 seconde
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-center">
          Modifier le profil
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Nom"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Email"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Nouveau mot de passe (optionnel)"
          />

          {/* MESSAGE SUCCESS */}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 rounded-lg text-white font-medium transition
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"}
            `}
          >
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;