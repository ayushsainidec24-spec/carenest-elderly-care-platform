import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5000/api"
    : "https://carenest-elderly-care-platform-1.onrender.com/api");

export default axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});
