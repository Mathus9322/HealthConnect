import React, { useEffect, useState } from "react";
import DoctorCard from "../components/doctors/DoctorCard";
import { Loader } from "lucide-react";
import api from "../api/axios";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Récupération depuis Laravel
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data);
        setSpecialties([...new Set(res.data.map((doc) => doc.specialty))]);
      } catch (error) {
        console.error("Erreur chargement médecins", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);



  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if(loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-teal-600" size={32} />
          <p className="text-gray-600 font-medium">Chargement des medecins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h2 className="text-4xl font-bold text-teal-600 mb-2">Nos Médecins</h2>
        <p className="text-gray-500">Trouvez le spécialiste qu’il vous faut</p>

        {/* Filter and search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Toutes les spécialités</option>
            {specialities.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>


      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;