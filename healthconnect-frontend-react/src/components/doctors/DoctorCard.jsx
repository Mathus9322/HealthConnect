import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition flex flex-col">
      {/* TOP */}
      <div className="flex gap-4 mb-6">
        <img
          src={doctor.image || "https://randomuser.me/api/portraits/men/1.jpg"}
          alt={doctor.user.name}
          className="w-24 h-24 rounded-xl object-cover"
        />
        <div>
          <h3 className="text-lg font-bold">{doctor.user.name}</h3>
          <p className="text-teal-600 text-sm">{doctor.specialty || "Médecin"}</p>
          <div className="text-teal-800 text-sm mt-2">⭐ {doctor.rating || 4.5}</div>
        </div>
      </div>
      {/* bio */}
      <p className="text-gray-600 text-sm mb-6 flex-1">
        {doctor.bio || "Médecin passionné avec plus de 10 ans d'expérience dans le domaine de la santé."}
      </p>

      {/* INFOS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-3 rounded-xl text-center">
          <p className="text-xs text-gray-500">Expérience</p>
          <p className="font-bold">{doctor.experience || "5"} <span className="text-teal-900">ans</span></p>
        </div>

        <div className="bg-gray-100 p-3 rounded-xl text-center">
          <p className="text-xs text-gray-500">Consultation</p>
          <p className="font-bold">{doctor.price || "50"} <span className="text-teal-900">€</span></p>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => navigate(`/appointments/create/${doctor.id}`)}
        className="mt-auto bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-full font-semibold hover:scale-105 transition"
      >
        Prendre rendez-vous
      </button>
    </div>
  );
};

export default DoctorCard;