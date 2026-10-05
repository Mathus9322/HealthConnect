import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Navigation, Star,
} from "lucide-react";
import { formatDistance } from "../../utils/geo";
import { formatAmount, CURRENCY } from "../../utils/currency";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white rounded-2xl p-5 shadow hover:shadow-lg transition flex flex-col h-full">
      {/* DISTANCE */}
      {formatDistance(doctor.distance) && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Navigation size={12} />
          {formatDistance(doctor.distance)}
        </span>
      )}
      {/* TOP */}
      <div className="flex items-center gap-4">
        {doctor.user?.avatar ? (
          <img
            src={doctor.user.avatar}
            alt={doctor.user.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
            {doctor.user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className={`min-w-0 space-y-1 ${formatDistance(doctor.distance) ? "pr-16" : ""}`}>
          <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{doctor.user.name}</h3>
          <p className="text-teal-600 text-sm truncate">{doctor.specialty || "Médecin"}</p>
          {(doctor.locality || doctor.region) && (
            <p className="flex items-center gap-1 text-gray-500 text-xs">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">
                {[doctor.locality, doctor.region].filter((v, i, arr) => v && arr.indexOf(v) === i).join(", ")}
              </span>
            </p>
          )}
          <div className="flex items-center gap-1 text-teal-800 text-xs"><Star size={13} className="text-amber-400 fill-amber-400" /> {doctor.rating || 4.5}</div>
        </div>
      </div>
      {/* bio */}
      <p className="text-gray-600 text-sm leading-relaxed mt-4 line-clamp-3 min-h-[4.5rem]">
        {doctor.bio || "Médecin passionné avec plus de 10 ans d'expérience dans le domaine de la santé."}
      </p>

      {/* INFOS */}
      <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
        <div className="bg-gray-100 px-2 py-2.5 rounded-xl text-center">
          <p className="text-xs text-gray-500 mb-0.5">Expérience</p>
          <p className="font-bold text-sm whitespace-nowrap">{doctor.experience || "5"} <span className="text-teal-900">ans</span></p>
        </div>

        <div className="bg-gray-100 px-2 py-2.5 rounded-xl text-center">
          <p className="text-xs text-gray-500 mb-0.5">Consultation</p>
          {formatAmount(doctor.price) ? (
            <p className="font-bold text-sm whitespace-nowrap">{formatAmount(doctor.price)} <span className="text-teal-900">{CURRENCY}</span></p>
          ) : (
            <p className="text-sm text-gray-500">Non renseigné</p>
          )}
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => navigate(`/patient/appointments?doctor=${doctor.id}`)}
        className="mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition"
      >
        Prendre rendez-vous
      </button>
    </div>
  );
};

export default DoctorCard;