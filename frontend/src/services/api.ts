import axios, { AxiosInstance, AxiosError } from "axios";

// ---- Base config ----
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ---- Request interceptor: attach auth token if present ----
api.interceptors.request.use(
  (config) => {
    const stored =
      localStorage.getItem("transitops_user") ||
      sessionStorage.getItem("transitops_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: basic error normalization ----
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("transitops_user");
      sessionStorage.removeItem("transitops_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string, role: string) =>
    api.post("/auth/login", { email, password, role }),
  logout: () => api.post("/auth/logout"),
};

// ---- Vehicles ----
export const vehicleApi = {
  getAll: () => api.get("/vehicles"),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => api.post("/vehicles", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// ---- Drivers ----
export const driverApi = {
  getAll: () => api.get("/drivers"),
  getById: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/drivers", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
};

// ---- Trips ----
export const tripApi = {
  getAll: () => api.get("/trips"),
  getById: (id: string) => api.get(`/trips/${id}`),
  create: (data: Record<string, unknown>) => api.post("/trips", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/trips/${id}`, data),
  dispatch: (data: Record<string, unknown>) => api.post(`/trips/dispatch`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
};

// ---- Maintenance ----
export const maintenanceApi = {
  getAll: () => api.get("/maintenance"),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  create: (data: Record<string, unknown>) => api.post("/maintenance", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
};

// ---- Fuel & Expenses ----
export const expenseApi = {
  getFuelLogs: () => api.get("/expenses/fuel"),
  logFuel: (data: Record<string, unknown>) => api.post("/expenses/fuel", data),
  getExpenses: () => api.get("/expenses"),
  addExpense: (data: Record<string, unknown>) => api.post("/expenses", data),
};

// ---- Dashboard / Analytics ----
export const analyticsApi = {
  getDashboardStats: () => api.get("/analytics/dashboard"),
  getReports: () => api.get("/analytics/reports"),
};

export default api;
