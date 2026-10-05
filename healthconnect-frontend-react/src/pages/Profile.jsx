import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "../components/profile/EditProfileModal";
import { Camera, Pencil, Lock, CheckCircle, Calendar, MessageCircle } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [preview, setPreview] = useState(user?.avatar || null);

  const getInitial = (name) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center">

        <div className="flex items-center gap-6">

          {/* Avatar upload */}
          <label className="cursor-pointer relative group">
            {preview ? (
              <img
                src={preview}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt=""
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white text-teal-600 flex items-center justify-center text-3xl font-bold">
                {getInitial(user?.name)}
              </div>
            )}

            <input
              type="file"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-sm">
              <Camera size={20} />
            </div>
          </label>

          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-teal-100">{user?.email}</p>

            <span className="mt-2 inline-block bg-white/20 px-3 py-1 text-xs rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="mt-4 md:mt-0 bg-white text-teal-600 px-6 py-2 rounded-xl font-medium shadow hover:scale-105 transition"
        >
          <Pencil size={16} className="inline-block align-[-3px] mr-1.5" />Modifier profil
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">

        {/* INFOS */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">
          <h3 className="font-semibold mb-6 text-gray-800">
            Informations personnelles
          </h3>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-gray-400">Nom</p>
              <p className="font-semibold">{user?.name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Rôle</p>
              <p className="font-semibold capitalize">{user?.role}</p>
            </div>

          </div>

          {/* PASSWORD */}
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Sécurité</h4>
            <button className="text-sm text-teal-600 hover:underline">
              <Lock size={14} className="inline-block align-[-3px] mr-1.5" />Changer mot de passe
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-400">Consultations</p>
            <h2 className="text-2xl font-bold text-teal-600">
              24
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-400">Patients</p>
            <h2 className="text-2xl font-bold text-blue-600">
              12
            </h2>
          </div>

        </div>

      </div>

      {/* ACTIVITÉ */}
      <div className="bg-white p-6 rounded-2xl shadow mt-10">
        <h3 className="font-semibold mb-4 text-gray-800">
          Activité récente
        </h3>

        <ul className="space-y-3 text-sm text-gray-500">
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-600" /> Profil mis à jour</li>
          <li className="flex items-center gap-2"><Calendar size={16} className="text-teal-600" /> Consultation avec patient</li>
          <li className="flex items-center gap-2"><MessageCircle size={16} className="text-teal-600" /> Message envoyé</li>
        </ul>
      </div>

      {/* MODAL */}
      {openModal && (
        <EditProfileModal onClose={() => setOpenModal(false)} />
      )}

    </div>
  );
};

export default Profile;