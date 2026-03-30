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


// patient
import PatientAppointment from "./pages/patient/PatientAppointments";


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



            {/* Routes protégées pour tous les utilisateurs connectés */}
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute>
                  <PatientAppointment />
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