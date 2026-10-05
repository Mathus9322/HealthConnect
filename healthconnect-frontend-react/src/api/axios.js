import axios from "axios";

// Sans REACT_APP_API_URL, l'API est cherchée sur la même machine que le site :
// fonctionne aussi bien sur le PC (localhost) que depuis un téléphone (IP du PC)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// Ajouter automatiquement le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;