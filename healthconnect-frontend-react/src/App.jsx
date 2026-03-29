// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login"
import Register from "./pages/Register";


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


    

          </Routes>
        </AppLayout>
        
      </Router>
    </AuthProvider>
  );
}

export default App;