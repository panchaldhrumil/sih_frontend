import React, { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    N: 120,
    P: 30,
    K: 80,
    ph: 6.5,
    rainfall: 200,
    temperature: 28,
    location: ""
  });
  const [rec, setRec] = useState(null);
  const [yieldPred, setYieldPred] = useState(null);
  const API_BASE = "http://localhost:8000";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: isNaN(Number(value)) ? value : Number(value) }));
  }

  async function getRecommendation() {
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || "Server error");
      setRec(j);
      setYieldPred(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function getYield() {
    if (!rec || !rec.recommended_crop) return alert("Get recommendation first");
    const body = { ...form, crop: rec.recommended_crop };
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || "Server error");
      setYieldPred(j);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function getWeather() {
    try {
      const res = await fetch(`${API_BASE}/weather?location=${encodeURIComponent(form.location || "")}`);
      const j = await res.json();
      alert("Mock weather: " + JSON.stringify(j));
    } catch (err) {
      alert("Weather error: " + err.message);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>SIH Crop Recommendation Dashboard</h1>

        <div className="grid">
          <label>N (kg/ha)<input name="N" value={form.N} onChange={handleChange} /></label>
          <label>P (kg/ha)<input name="P" value={form.P} onChange={handleChange} /></label>
          <label>K (kg/ha)<input name="K" value={form.K} onChange={handleChange} /></label>
          <label>pH<input name="ph" value={form.ph} onChange={handleChange} /></label>
          <label>Rainfall (mm)<input name="rainfall" value={form.rainfall} onChange={handleChange} /></label>
          <label>Temperature (°C)<input name="temperature" value={form.temperature} onChange={handleChange} /></label>
        </div>

        <div className="actions">
          <button onClick={getRecommendation} className="btn primary">Get Recommendation</button>
          <button onClick={getYield} className="btn">Predict Yield</button>
          <button onClick={getWeather} className="btn">Weather</button>
        </div>

        <section>
          <h2>Recommendation</h2>
          <pre className="output">{rec ? JSON.stringify(rec, null, 2) : "No recommendation yet"}</pre>
        </section>

        <section>
          <h2>Yield Prediction</h2>
          <pre className="output">{yieldPred ? JSON.stringify(yieldPred, null, 2) : "No yield predicted"}</pre>
        </section>
      </div>
    </div>
  );
}
