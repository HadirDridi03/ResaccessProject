// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AddEquipment from "./pages/AddEquipment";
import EquipmentList from "./pages/EquipmentList";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes générales */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Routes équipements */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/add" element={<AddEquipment />} />
        <Route path="/equipment/add/:id" element={<AddEquipment />} />
      </Routes>
    </Router>
  );
}

export default App;
