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
  register: (email: string, password: string, full_name: string, role: string) =>
    api.post("/auth/register", { email, password, full_name, role }),
  logout: () => api.post("/auth/logout"),
};

// ---- Vehicles ----
export const vehicleApi = {
  getAll: () => api.get("/vehicles"),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => api.post("/vehicles", data),
};

// ---- Drivers ----
export const driverApi = {
  getAll: () => api.get("/drivers"),
  getById: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/drivers", data),
};

// ---- Trips ----
export const tripApi = {
  getAll: () => api.get("/trips"),
  getById: (id: string) => api.get(`/trips/${id}`),
  create: (data: Record<string, unknown>) => api.post("/trips", data),
  dispatch: (data: Record<string, unknown>) => api.post(`/trips/dispatch`, data),
};

// ---- Maintenance ----
export const maintenanceApi = {
  getAll: () => api.get("/maintenance"),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  create: (data: Record<string, unknown>) => api.post("/maintenance", data),
  // Backend expects status as query param: PUT /maintenance/{id}/status?status=completed
  updateStatus: (id: string, status: string) =>
    api.put(`/maintenance/${id}/status?status=${status}`),
};

// ---- Fuel & Expenses ----
export const expenseApi = {
  getFuelLogs: () => api.get("/expenses/fuel"),
  // Backend expects: vehicle_id, date, gallons, cost, odometer_reading
  logFuel: (data: Record<string, unknown>) => api.post("/expenses/fuel", data),
  getExpenses: () => api.get("/expenses"),
  // Backend expects: trip_id, type (toll|parking|fine|other), amount, description, date
  addExpense: (data: Record<string, unknown>) => api.post("/expenses", data),
};

// ---- Dashboard / Analytics ----
export const analyticsApi = {
  getDashboardStats: () => api.get("/analytics/dashboard"),
  getReports: () => api.get("/analytics/reports"),
};

export default api;
