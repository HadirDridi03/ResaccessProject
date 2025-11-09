const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};

  // Validation basique
  if (type === "signup" && !formData.name.trim()) {
    newErrors.name = "Veuillez entrer votre nom complet.";
  }
  if (!formData.email.trim()) {
    newErrors.email = "Veuillez entrer une adresse e-mail.";
  }
  if (!formData.password.trim()) {
    newErrors.password = "Veuillez entrer un mot de passe.";
  }
  if (type === "signup" && formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    try {
      const url =
        type === "signup"
          ? "/api/auth/register"          // ← CORRIGÉ ICI
          : "/api/auth/login";            // ← CORRIGÉ ICI

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📡 Réponse du serveur :", data);

      if (response.ok) {
        alert("✅ " + (type === "signup" ? "Inscription réussie !" : "Connexion réussie !"));
        // redirige ou vide le formulaire :
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        alert("❌ Erreur : " + (data.message || "Une erreur est survenue."));
      }
    } catch (error) {
      console.error("❌ Erreur réseau :", error);
      alert("Erreur de connexion au serveur.");
    }
  }
};
