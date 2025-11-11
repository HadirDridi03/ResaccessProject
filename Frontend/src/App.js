import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddEquipment from './pages/AddEquipment';
import EquipmentList from './pages/EquipmentList'; // ← AJOUTE ÇA

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EquipmentList />} />
        <Route path="/add" element={<AddEquipment />} />
      </Routes>
    </Router>
  );
}
export default App;