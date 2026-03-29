import React, { useEffect, useState } from "react";
import DoctorCard from "../components/doctors/DoctorCard";
// import api from "../api/axios";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Récupération depuis Laravel
  // useEffect(() => {
  //   const fetchDoctors = async () => {
  //     try {
  //       const res = await api.get("/doctors");
  //       setDoctors(res.data);
  //     } catch (error) {
  //       console.error("Erreur chargement médecins", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDoctors();
  // }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-teal-600 mb-2">Nos Médecins</h2>
        <p className="text-gray-500">Trouvez le spécialiste qu’il vous faut</p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;