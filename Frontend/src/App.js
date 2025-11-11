// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddEquipment from './pages/AddEquipment';
import EquipmentList from './pages/EquipmentList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EquipmentList />} />
        <Route path="/add" element={<AddEquipment />} />
        <Route path="/add/:id" element={<AddEquipment />} /> {/* AJOUTE ÇA */}
      </Routes>
    </Router>
  );
}

export default App;