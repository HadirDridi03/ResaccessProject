import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AddEquipment from "./pages/AddEquipment"; // ← AJOUT

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/AddEquipment" element={<AddEquipment />} /> {/* ← AJOUT */}
      </Routes>
    </Router>
  );
}

export default App;
