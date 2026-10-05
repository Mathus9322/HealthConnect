import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
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
        <Routes>
          {/* ─── Pages publiques : navbar + footer ─── */}
          <Route element={<PublicLayout />}>
            <Route path="/"             element={<Home />} />
            <Route path="/doctors"      element={<Doctor />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* ─── Espace patient : sidebar ─── */}
          <Route element={<DashboardLayout roles={["patient"]} />}>
            <Route path="/dashboard/patient"     element={<PatientDashboard />} />
            <Route path="/patient/doctors"       element={<Doctor />} />
            <Route path="/patient/appointments"  element={<PatientAppointment />} />
            <Route path="/patient/messages"      element={<PatientMessages />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
          </Route>

          {/* ─── Espace médecin : sidebar ─── */}
          <Route element={<DashboardLayout roles={["doctor"]} />}>
            <Route path="/dashboard/doctor"     element={<DoctorDashboard />} />
            <Route path="/doctor/appointments"  element={<DoctorAppointment />} />
            <Route path="/doctor/messages"      element={<DoctorMessages />} />
            <Route path="/doctor/patients"      element={<DoctorPatients />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          </Route>

          {/* ─── Espace administrateur : sidebar ─── */}
          <Route element={<DashboardLayout roles={["admin"]} />}>
            <Route path="/dashboard/admin"     element={<AdminDashboard />} />
            <Route path="/admin/users"         element={<AdminUsers />} />
            <Route path="/admin/appointments"  element={<AdminAppointments />} />
            <Route path="/admin/messages"      element={<AdminMessages />} />
            <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
            <Route path="/admin/stats"         element={<AdminStats />} />
          </Route>

          {/* ─── Profil : tous les rôles connectés ─── */}
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
