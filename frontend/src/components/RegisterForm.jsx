import React, { useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function RegisterForm({ setResponse }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setResponse({ error: "All fields are required" });
      return;
    }

    setLoading(true);
    const result = await apiRequest("/api/auth/register", form);
    setResponse(result);

    if (result.user && result.token) {
      login(result.user, result.token);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <input
        className="w-full border rounded px-3 py-2 mb-2"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full border rounded px-3 py-2 mb-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        className="w-full border rounded px-3 py-2 mb-2"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default RegisterForm;
