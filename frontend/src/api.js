import axios from "axios";

// Point this at your deployed backend URL in production (e.g. Render).
const BASE_URL = import.meta.env.VITE_API_URL || "https://campus-helpdesk-backend-380g.onrender.com";

const client = axios.create({ baseURL: `${BASE_URL}/api` });

// Called by AuthContext whenever the token changes (login/logout/restore).
export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

// On a hard page refresh, re-attach a saved token before the first request fires.
const savedToken = localStorage.getItem("chd_token");
if (savedToken) setAuthToken(savedToken);

// ---------- Auth ----------
export const loginRequest = (email, password) =>
  client.post("/auth/login", { email, password }).then((r) => r.data);

export const registerRequest = (payload) =>
  client.post("/auth/register", payload).then((r) => r.data);

export const fetchMe = () => client.get("/auth/me").then((r) => r.data);

// ---------- Complaints ----------
export const submitComplaint = (data) =>
  client.post("/complaints", data).then((r) => r.data);

export const trackComplaint = (complaintId) =>
  client.get(`/complaints/${complaintId}`).then((r) => r.data);

export const listComplaints = (filters = {}) =>
  client.get("/complaints", { params: filters }).then((r) => r.data);

export const myComplaints = () => client.get("/complaints/mine").then((r) => r.data);

export const updateComplaint = (complaintId, data) =>
  client.patch(`/complaints/${complaintId}`, data).then((r) => r.data);

export const getSummary = () => client.get("/complaints/stats/summary").then((r) => r.data);

export default client;
