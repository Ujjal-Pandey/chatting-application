// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiRequest = async (endpoint, data = null, token = null, method = "POST") => {
  try {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    const url = `${BASE_URL}${normalizedEndpoint}`;

    const isFormData = data instanceof FormData;
    const headers = isFormData ? {} : { "Content-Type": "application/json" };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    if (data && method !== "GET" && method !== "HEAD") {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    const res = await fetch(url, options);

    const responseData = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMessage = "Request failed";
      if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors.map(err => err.msg).join(", ");
      } else if (typeof responseData === "string") {
        errorMessage = responseData;
      }
      return { error: errorMessage };
    }

    return responseData;
  } catch (err) {
    return { error: err.message };
  }
};
