import React, { useEffect, useRef, useState } from "react";
import DoctorCard from "../components/doctors/DoctorCard";
import { Loader, Search, SlidersHorizontal, RotateCcw, UserX, LocateFixed, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import api from "../api/axios";
import { formatPrice } from "../utils/currency";
import { distanceKm } from "../utils/geo";

const DAYS = [
  { value: "Monday", label: "Lundi" },
  { value: "Tuesday", label: "Mardi" },
  { value: "Wednesday", label: "Mercredi" },
  { value: "Thursday", label: "Jeudi" },
  { value: "Friday", label: "Vendredi" },
  { value: "Saturday", label: "Samedi" },
  { value: "Sunday", label: "Dimanche" },
];

const EXPERIENCE_OPTIONS = [
  { value: 0, label: "Toute expérience" },
  { value: 5, label: "5 ans et +" },
  { value: 10, label: "10 ans et +" },
  { value: 15, label: "15 ans et +" },
  { value: 20, label: "20 ans et +" },
];

const DISTANCE_OPTIONS = [
  { value: "", label: "Toute distance" },
  { value: 5, label: "Moins de 5 km" },
  { value: 10, label: "Moins de 10 km" },
  { value: 25, label: "Moins de 25 km" },
  { value: 50, label: "Moins de 50 km" },
  { value: 100, label: "Moins de 100 km" },
];

const GEO_ERRORS = {
  1: "Vous avez refusé l'accès à votre position. Autorisez-le dans votre navigateur pour trouver les médecins proches.",
  2: "Votre position est indisponible pour le moment.",
  3: "La localisation a pris trop de temps. Réessayez.",
};

const SORT_OPTIONS = [
  { value: "", label: "Pertinence" },
  { value: "experience", label: "Plus expérimentés" },
  { value: "price-asc", label: "Tarif croissant" },
  { value: "price-desc", label: "Tarif décroissant" },
  { value: "name", label: "Nom (A → Z)" },
];

// available_time arrive parfois sous forme de chaîne JSON
const getAvailableDays = (availableTime) => {
  try {
    const parsed = typeof availableTime === "string" ? JSON.parse(availableTime) : availableTime;
    return Object.keys(parsed || {});
  } catch {
    return [];
  }
};

const normalize = (text = "") =>
  text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const selectClass =
  "w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [minExperience, setMinExperience] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | loading | ready | error
  const [geoError, setGeoError] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  // Filtres dépliés par défaut sur grand écran (≥ 1024 px, breakpoint lg de Tailwind)
  const [filtersOpen, setFiltersOpen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupération depuis Laravel
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        const data = Array.isArray(res.data) ? res.data : [];
        setDoctors(data);
        setSpecialties([...new Set(data.map((doc) => doc.specialty).filter(Boolean))].sort());
      } catch (error) {
        console.error("Erreur chargement médecins", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);



  const prices = doctors.map((doc) => Number(doc.price)).filter((price) => !isNaN(price));
  const highestPrice = prices.length ? Math.max(...prices) : 0;

  const regions = [...new Set(doctors.map((doc) => doc.region).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const localities = [...new Set(
    doctors
      .filter((doc) => selectedRegion === "" || doc.region === selectedRegion)
      .map((doc) => doc.locality)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const hasActiveFilters =
    searchTerm || selectedSpecialty || selectedRegion || selectedLocality || selectedDay || minExperience > 0 || maxPrice !== "" || maxDistance !== "" ||
    (sortBy && sortBy !== "distance");

  const locateUser = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      return;
    }
    setGeoStatus("loading");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("ready");
        setSortBy("distance");
      },
      (error) => {
        setGeoStatus("error");
        setGeoError(GEO_ERRORS[error.code] || "Impossible de déterminer votre position.");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const clearPosition = () => {
    setUserPosition(null);
    setGeoStatus("idle");
    setMaxDistance("");
    if (sortBy === "distance") setSortBy("");
  };

  const sortOptions = userPosition
    ? [{ value: "distance", label: "Plus proches" }, ...SORT_OPTIONS]
    : SORT_OPTIONS;

  const activeFilterCount = [
    selectedSpecialty,
    selectedRegion,
    selectedLocality,
    selectedDay,
    minExperience > 0,
    maxPrice !== "",
    sortBy && sortBy !== "distance",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setSelectedRegion("");
    setSelectedLocality("");
    setSelectedDay("");
    setMinExperience(0);
    setMaxPrice("");
    setMaxDistance("");
    setSortBy(userPosition ? "distance" : "");
  };

  const filteredDoctors = doctors
    .map((doctor) => ({
      ...doctor,
      distance:
        userPosition && doctor.latitude != null && doctor.longitude != null
          ? distanceKm(userPosition.lat, userPosition.lng, Number(doctor.latitude), Number(doctor.longitude))
          : null,
    }))
    .filter((doctor) => {
      const term = normalize(searchTerm);
      const matchesSearch =
        !term ||
        normalize(doctor.user?.name).includes(term) ||
        normalize(doctor.specialty).includes(term) ||
        normalize(doctor.bio).includes(term) ||
        normalize(doctor.region).includes(term) ||
        normalize(doctor.locality).includes(term);
      const matchesSpecialty =
        selectedSpecialty === "" || doctor.specialty === selectedSpecialty;
      const matchesRegion = selectedRegion === "" || doctor.region === selectedRegion;
      const matchesLocality = selectedLocality === "" || doctor.locality === selectedLocality;
      const matchesDay =
        selectedDay === "" || getAvailableDays(doctor.available_time).includes(selectedDay);
      const matchesExperience = (doctor.experience || 0) >= minExperience;
      const matchesPrice = maxPrice === "" || Number(doctor.price) <= Number(maxPrice);
      const matchesDistance =
        maxDistance === "" || (doctor.distance !== null && doctor.distance <= Number(maxDistance));
      return matchesDistance && matchesSearch && matchesSpecialty && matchesRegion && matchesLocality && matchesDay && matchesExperience && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "distance": return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        case "experience": return (b.experience || 0) - (a.experience || 0);
        case "price-asc": return Number(a.price) - Number(b.price);
        case "price-desc": return Number(b.price) - Number(a.price);
        case "name": return (a.user?.name || "").localeCompare(b.user?.name || "");
        default: return 0;
      }
    });

  // Clé qui change dès que la liste filtrée change : on revient au début du scroller
  const listKey = filteredDoctors.map((doc) => doc.id).join(",");

  const updateScrollButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey, loading]);

  const scrollByPage = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

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
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, spécialité, ville ou mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls="doctor-filters"
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium border transition whitespace-nowrap ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtres
              {activeFilterCount > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={locateUser}
              disabled={geoStatus === "loading"}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                geoStatus === "ready"
                  ? "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20"
              } disabled:opacity-60`}
            >
              {geoStatus === "loading" ? <Loader size={18} className="animate-spin" /> : <LocateFixed size={18} />}
              {geoStatus === "loading" ? "Localisation..." : geoStatus === "ready" ? "Actualiser ma position" : "Près de moi"}
            </button>
          </div>

          {/* POSITION */}
          {geoStatus === "error" && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{geoError}</p>
          )}

          {userPosition && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-teal-50/70 border border-teal-100 rounded-xl px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-teal-800 flex-1">
                <LocateFixed size={16} />
                Position activée : les médecins sont classés du plus proche au plus éloigné.
              </p>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value === "" ? "" : Number(e.target.value))}
                className="border border-teal-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={clearPosition}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
              >
                <X size={14} /> Désactiver
              </button>
            </div>
          )}

          {/* FILTRES DÉPLIABLES */}
          <div
            id="doctor-filters"
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] !mt-0"
            }`}
          >
          <div className={`overflow-hidden transition-all duration-300 ${filtersOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 pb-1">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Spécialité</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className={selectClass}>
                <option value="">Toutes les spécialités</option>
                {specialities.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Région</label>
              <select
                value={selectedRegion}
                onChange={(e) => { setSelectedRegion(e.target.value); setSelectedLocality(""); }}
                className={selectClass}>
                <option value="">Toutes les régions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Localité</label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className={selectClass}>
                <option value="">Toutes les localités</option>
                {localities.map((locality) => (
                  <option key={locality} value={locality}>{locality}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Disponible le</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className={selectClass}>
                <option value="">N'importe quel jour</option>
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expérience</label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className={selectClass}>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tarif max {maxPrice !== "" && <span className="text-teal-600 font-semibold">: {formatPrice(maxPrice)}</span>}
              </label>
              <input
                type="range"
                min={0}
                max={highestPrice || 0}
                step={500}
                value={maxPrice === "" ? highestPrice : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value) >= highestPrice ? "" : e.target.value)}
                disabled={!highestPrice}
                className="w-full mt-3 accent-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={selectClass}>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <SlidersHorizontal size={16} />
              <span><span className="font-semibold text-gray-800">{filteredDoctors.length}</span> médecin{filteredDoctors.length > 1 ? "s" : ""} trouvé{filteredDoctors.length > 1 ? "s" : ""}</span>
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 font-medium"
              >
                <RotateCcw size={14} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

      </div>

      {/* SCROLLER HORIZONTAL */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {filteredDoctors.length > 0 ? (
          <div className="relative">
            {/* Flèches (ordinateur) */}
            <button
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
              aria-label="Médecins précédents"
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-teal-700 hover:bg-teal-50 transition disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
              aria-label="Médecins suivants"
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-teal-700 hover:bg-teal-50 transition disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight size={22} />
            </button>

            <div
              ref={scrollerRef}
              onScroll={updateScrollButtons}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-5 -mx-2 px-2 styled-scrollbar"
            >
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="snap-start shrink-0 flex w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
                >
                  <div className="w-full">
                    <DoctorCard doctor={doctor} />
                  </div>
                </div>
              ))}
            </div>

            <p className="md:hidden text-center text-xs text-gray-400 mt-2">
              Faites glisser pour voir plus de médecins
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-16 text-gray-500">
            <UserX size={40} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">Aucun médecin ne correspond à vos critères</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-3 text-sm text-teal-700 font-medium hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;