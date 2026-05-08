import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "react-datepicker/dist/react-datepicker.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctor from "./pages/Doctors";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";

// Patient
import PatientDashboard    from "./pages/patient/PatientDashboard";
import PatientAppointment  from "./pages/patient/PatientAppointments";
import PatientMessages     from "./pages/patient/PatientMessages";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";

// Médecin
import DoctorDashboard     from "./pages/doctor/DoctorDashboard";
import DoctorAppointment   from "./pages/doctor/DoctorAppointments";
import DoctorMessages      from "./pages/doctor/DoctorMessages";
import DoctorPatients      from "./pages/doctor/DoctorPatients";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";

// Admin
import AdminDashboard      from "./pages/admin/AdminDashboard";
import AdminUsers          from "./pages/admin/AdminUsers";
import AdminAppointments   from "./pages/admin/AdminAppointments";
import AdminMessages       from "./pages/admin/AdminMessages";
import AdminPrescriptions  from "./pages/admin/AdminPrescriptions";
import AdminStats          from "./pages/admin/AdminStats";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* ─── Publiques ─── */}
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/doctors"     element={<Doctor />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ─── Patient ─── */}
            <Route path="/dashboard/patient"     element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments"  element={<ProtectedRoute roles={["patient"]}><PatientAppointment /></ProtectedRoute>} />
            <Route path="/patient/messages"      element={<ProtectedRoute roles={["patient"]}><PatientMessages /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute roles={["patient"]}><PatientPrescriptions /></ProtectedRoute>} />

            {/* ─── Médecin ─── */}
            <Route path="/dashboard/doctor"      element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments"   element={<ProtectedRoute roles={["doctor"]}><DoctorAppointment /></ProtectedRoute>} />
            <Route path="/doctor/messages"       element={<ProtectedRoute roles={["doctor"]}><DoctorMessages /></ProtectedRoute>} />
            <Route path="/doctor/patients"       element={<ProtectedRoute roles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions"  element={<ProtectedRoute roles={["doctor"]}><DoctorPrescriptions /></ProtectedRoute>} />

            {/* ─── Admin ─── */}
            <Route path="/dashboard/admin"      element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"          element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/appointments"   element={<ProtectedRoute roles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/messages"       element={<ProtectedRoute roles={["admin"]}><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/prescriptions"  element={<ProtectedRoute roles={["admin"]}><AdminPrescriptions /></ProtectedRoute>} />
            <Route path="/admin/stats"          element={<ProtectedRoute roles={["admin"]}><AdminStats /></ProtectedRoute>} />

            {/* ─── Profil ─── */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
