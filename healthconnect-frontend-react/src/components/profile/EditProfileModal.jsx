import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/profile";
import Swal from "sweetalert2";

const EditProfileModal = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: null,
    specialty: user.role === "doctor" ? user.profile?.specialty : "",
    license_number: user.role === "doctor" ? user.profile?.license_number : "",
  });
  const [preview, setPreview] = useState(user.avatar || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(user.id, formData);
      setUser(res.user); // met à jour le context
      Swal.fire("Succès", "Profil mis à jour !", "success");
      onClose();
    } catch (err) {
      Swal.fire("Erreur", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Modifier profil</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <input type="file" name="avatar" onChange={handleChange} />
          </div>

          {/* Nom et Email */}
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />

          {/* Spécifique docteur */}
          {user.role === "doctor" && (
            <>
              <input
                type="text"
                name="specialty"
                placeholder="Spécialité"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-xl"
              />
              <input
                type="text"
                name="license_number"
                placeholder="Numéro de licence"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-xl"
              />
            </>
          )}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white"
            >
              {loading ? "En cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;