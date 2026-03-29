// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

import Home from "./pages/Home";


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />

          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;