import React, { useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function MessageForm({ setResponse }) {
  const [form, setForm] = useState({ receiverId: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!form.receiverId || !form.message) {
      setResponse({ error: "Receiver ID and message are required" });
      return;
    }

    setLoading(true);
    const result = await apiRequest("/api/messages/send", form, token);
    setResponse(result);
    setLoading(false);

    if (!result.error) {
      setForm({ receiverId: "", message: "" });
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Send Message</h2>
      <input
        className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Receiver ID"
        value={form.receiverId}
        onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
      />
      <input
        className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Message"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}

export default MessageForm;
