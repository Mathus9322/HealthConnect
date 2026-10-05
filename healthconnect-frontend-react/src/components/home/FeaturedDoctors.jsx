import React from "react";
import { Link } from "react-router-dom";
import { Award, CalendarDays, ArrowRight, MapPin } from "lucide-react";
import { formatAmount, CURRENCY } from "../../utils/currency";


const DAYS_FR = {
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mer",
  Thursday: "Jeu",
  Friday: "Ven",
  Saturday: "Sam",
  Sunday: "Dim",
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// available_time arrive parfois sous forme de chaîne JSON
const getAvailableDays = (availableTime) => {
  try {
    const parsed = typeof availableTime === "string" ? JSON.parse(availableTime) : availableTime;
    return Object.keys(parsed || {}).map((day) => DAYS_FR[day] || day);
  } catch {
    return [];
  }
};


const FeaturedDoctors = ({ doctors = [], loading = false }) => {

  const featured = [...doctors]
    .sort((a, b) => (b.experience || 0) - (a.experience || 0))
    .slice(0, 3);

  if (!loading && featured.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-teal-50/60 to-white py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">
              Nos praticiens
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Des médecins à votre écoute
            </h2>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-teal-700 font-medium hover:gap-3 transition-all"
          >
            Voir tous les médecins <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            : featured.map((doc) => {
                const days = getAvailableDays(doc.available_time);
                return (
                  <div
                    key={doc.id}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      {doc.user?.avatar ? (
                        <img
                          src={doc.user.avatar}
                          alt={doc.user?.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-lg font-bold flex items-center justify-center ring-4 ring-teal-50">
                          {getInitials(doc.user?.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">Dr. {doc.user?.name}</p>
                        <p className="text-sm text-teal-600">{doc.specialty}</p>
                        {doc.region && (
                          <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin size={12} />
                            {doc.locality && doc.locality !== doc.region ? `${doc.locality}, ${doc.region}` : doc.region}
                          </p>
                        )}
                      </div>
                    </div>

                    {doc.bio && (
                      <p className="text-sm text-gray-600 mb-5 line-clamp-2">{doc.bio}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-5">
                      <span className="inline-flex items-center gap-1">
                        <Award size={14} className="text-teal-600" />
                        {doc.experience} ans d'expérience
                      </span>
                      {days.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} className="text-teal-600" />
                          {days.join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {formatAmount(doc.price) ? (
                        <p className="text-sm text-gray-500">
                          <span className="text-lg font-bold text-gray-900">{formatAmount(doc.price)}</span> {CURRENCY}
                        </p>
                      ) : (
                        <span />
                      )}
                      <Link
                        to={`/patient/appointments?doctor=${doc.id}`}
                        className="text-sm font-medium bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white px-4 py-2 rounded-lg transition"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>

      </div>
    </section>
  );
};

export default FeaturedDoctors;
