import React, { useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function LoginForm({ setResponse }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setResponse({ error: "Email and password are required" });
      return;
    }

    setLoading(true);
    const result = await apiRequest("/api/auth/login", form);
    setResponse(result);

    if (result.user && result.token) {
      login(result.user, result.token);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <input
        className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default LoginForm;
