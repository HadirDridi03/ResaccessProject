import React from "react";

function App() {
  const testBackend = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      alert(`✅ BACKEND CONNECTÉ!\n${data.message}`);
    } catch (error) {
      alert("❌ Backend non accessible");
    }
  };

  return (
    <div style={{ 
      padding: "50px", 
      textAlign: "center",
      fontFamily: "Arial, sans-serif" 
    }}>
      <h1 style={{ color: "green" }}>🎉 RESACCESS PROJECT</h1>
      <p>Test d'intégration Backend-Frontend</p>
      
      <button 
        onClick={testBackend}
        style={{
          padding: "15px 30px",
          fontSize: "18px", 
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          margin: "20px"
        }}
      >
        🔗 Tester la connexion Backend
      </button>

      <div style={{ marginTop: "30px" }}>
        <p><strong>Backend:</strong> http://localhost:5000</p>
        <p><strong>Frontend:</strong> http://localhost:3000</p>
        <p><strong>Status:</strong> ✅ Intégration fonctionnelle</p>
      </div>
    </div>
  );
}

export default App;
