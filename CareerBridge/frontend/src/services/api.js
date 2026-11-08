import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

// Add shared authentication token handling here once the team finalizes
// its authentication approach. Do not create separate Axios clients per module.

export default api;
