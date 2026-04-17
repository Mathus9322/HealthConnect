// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "react-datepicker/dist/react-datepicker.css";

import Home from "./pages/Home";
import Login from "./pages/Login"
import Register from "./pages/Register";
import Doctor from "./pages/Doctors";

import Profile from "./pages/Profile";

import Unauthorized from "./pages/Unauthorized";

// patient
import PatientAppointment from "./pages/patient/PatientAppointments";
import PatientDashboard from "./pages/patient/PatientDashboard";

// Medecin
import DoctorAppointment from "./pages/doctor/DoctorAppointments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorMessages from "./pages/doctor/DoctorMessages";


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctor />} />
            <Route path="/unauthorized" element={<Unauthorized />} />



            {/* Routes protégées pour tous les utilisateurs connectés */}

            {/* Patient */}
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute roles={['patient']}>
                  <PatientAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute roles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />


            {/* Medecin */}
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DoctorAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/messages"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DoctorMessages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />



          </Routes>
        </AppLayout>

      </Router>
    </AuthProvider>
  );
}

export default App;