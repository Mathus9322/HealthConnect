import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "../components/profile/EditProfileModal";

const Profile = () => {
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold">
            {!user.avatar ?
              (user.name?.charAt(0).toUpperCase()
              ) : (
                <img className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold" src={user.avatar} alt={user.avatar}></img>
              )
            }
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          Modifier profil
        </button>
      </div>

      {/* INFOS */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Rôle</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <EditProfileModal onClose={() => setOpenModal(false)} />
      )}
    </div>
  );
};

export default Profile;