// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Pages admin
import AddEquipment from "./pages/AddEquipment";
import EquipmentList from "./pages/EquipmentList";

// Pages utilisateur
import UserHome from "./pages/UserHome";
import UserEquipmentList from "./pages/UserEquipmentList";
import UserEquipmentCalendar from "./pages/UserEquipmentCalendar";
import NewReservation from "./pages/NewReservation"; // AJOUT

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Routes admin */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/add" element={<AddEquipment />} />
        <Route path="/equipment/edit/:id" element={<AddEquipment />} />

        {/* Routes utilisateur */}
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/equipment" element={<UserEquipmentList />} />
        <Route path="/user/equipment/:id/calendar" element={<UserEquipmentCalendar />} />
        <Route path="/reservation/new" element={<NewReservation />} /> {/* AJOUT */}
      </Routes>
    </Router>
  );
}

export default App;