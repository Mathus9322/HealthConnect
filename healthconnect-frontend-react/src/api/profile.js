import api from "./axios";

// Récupérer le profil
export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

// Mettre à jour le profil
export const updateProfile = async (id, data) => {
  // data peut contenir avatar (file), name, email, specialty, license_number, etc.
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) formData.append(key, data[key]);
  });

  const res = await api.put(`/profile/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};