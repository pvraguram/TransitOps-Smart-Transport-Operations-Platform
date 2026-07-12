// src/data/mockData.ts
import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  FuelLog,
  ExpenseEntry,
  Kpi,
  RecentTrip,
  VehicleStatusSummary,
  AnalyticsKpi,
  RevenuePoint,
  CostliestVehicle,
} from "../types";

// ---------- Auth ----------
export const mockUser: User = {
  id: "u1",
  name: "Raven K.",
  email: "raven.k@transitops.in",
  role: "Dispatcher",
};

// ---------- Dashboard ----------
export const dashboardKpis: Kpi[] = [
  { label: "Active Vehicles", value: 53 },
  { label: "Available Vehicles", value: 42 },
  { label: "Vehicles in Maintenance", value: "05", accent: "rose" },
  { label: "Active Trips", value: 18 },
  { label: "Pending Trips", value: "09", accent: "orange" },
  { label: "Drivers on Duty", value: 26 },
  { label: "Fleet Utilization", value: "81%", accent: "orange" },
];

export const recentTrips: RecentTrip[] = [
  { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
  { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "--" },
  { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "In 10m" },
  { id: "TR006", vehicle: "--", driver: "--", status: "Draft", eta: "Awaiting vehicle" },
];

export const vehicleStatusBreakdown: VehicleStatusSummary[] = [
  { label: "Available", count: 42, color: "#F39F5A" },
  { label: "On Trip", count: 18, color: "#662549" },
  { label: "In Shop", count: 5, color: "#AE445A" },
  { label: "Retired", count: 2, color: "#1D1A39" },
];

// ---------- Vehicles ----------
export const vehicles: Vehicle[] = [
  { id: "v1", regNo: "GJ01ABH521", nameModel: "VAN-05", type: "Van", capacity: "500 kg", odometer: 74000, acquisitionCost: 620000, status: "Available" },
  { id: "v2", regNo: "GJ01AB4491", nameModel: "TRUCK-11", type: "Truck", capacity: "5 Ton", odometer: 182000, acquisitionCost: 2450000, status: "On Trip" },
  { id: "v3", regNo: "GJ01AB4120", nameModel: "MINI-03", type: "Mini", capacity: "1 Ton", odometer: 66000, acquisitionCost: 410000, status: "In Shop" },
  { id: "v4", regNo: "GJ01AB0087", nameModel: "VAN-09", type: "Van", capacity: "750 kg", odometer: 24900, acquisitionCost: 540000, status: "Retired" },
];

// ---------- Drivers ----------
export const drivers: Driver[] = [
  { id: "d1", name: "Alex", licenseNo: "DL-88213", category: "LMV", expiry: "12/2028", expired: false, contact: "98765xxxxx", tripCompletion: 96, safety: "Available", status: "Available" },
  { id: "d2", name: "John", licenseNo: "DL-44120", category: "HMV", expiry: "03/2025", expired: true, contact: "98220xxxxx", tripCompletion: 81, safety: "Suspended", status: "Suspended" },
  { id: "d3", name: "Priya", licenseNo: "DL-77031", category: "LMV", expiry: "08/2027", expired: false, contact: "99110xxxxx", tripCompletion: 99, safety: "Available", status: "On Trip" },
  { id: "d4", name: "Suresh", licenseNo: "DL-90045", category: "HMV", expiry: "01/2027", expired: false, contact: "99440xxxxx", tripCompletion: 88, safety: "Available", status: "Off Duty" },
];

// ---------- Trips (dispatcher lifecycle board) ----------
export const trips: Trip[] = [
  { id: "TR001", source: "Gandhinagar Depot", destination: "Ahmedabad Hub", vehicle: "VAN-05", driver: "Alex", cargoWeight: 400, plannedDistance: 32, status: "Dispatched", eta: "45 min" },
  { id: "TR004", source: "Vatva Industrial Area", destination: "Sanand Warehouse", vehicle: "TRUCK-11", driver: "Suresh", cargoWeight: 4200, plannedDistance: 28, status: "Draft", eta: "--" },
  { id: "TR006", source: "Mansa", destination: "Kalol Depot", cargoWeight: 700, plannedDistance: 38, status: "Cancelled", eta: "Vehicle went to shop" },
];

// ---------- Maintenance ----------
export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "m1", vehicle: "VAN-05", serviceType: "Oil Change", cost: 2500, date: "2026-07-05", status: "In Shop" },
  { id: "m2", vehicle: "TRUCK-11", serviceType: "Engine Repair", cost: 18000, date: "2026-07-06", status: "Completed" },
  { id: "m3", vehicle: "MINI-03", serviceType: "Tyre Replace", cost: 6200, date: "2026-07-03", status: "In Shop" },
];

// ---------- Fuel & Expenses ----------
export const fuelLogs: FuelLog[] = [
  { id: "f1", vehicle: "VAN-05", date: "2026-07-05", liters: 42, fuelCost: 3150 },
  { id: "f2", vehicle: "TRUCK-11", date: "2026-07-06", liters: 110, fuelCost: 8400 },
  { id: "f3", vehicle: "MINI-08", date: "2026-07-06", liters: 28, fuelCost: 2050 },
];

export const expenseEntries: ExpenseEntry[] = [
  { id: "e1", trip: "TR001", vehicle: "VAN-05", toll: 120, other: 0, maintLinked: 0, total: 3150, status: "Available" },
  { id: "e2", trip: "TR002", vehicle: "TRK-12", toll: 340, other: 150, maintLinked: 18000, total: 8400, status: "Completed" },
];

// ---------- Analytics ----------
export const analyticsKpis: AnalyticsKpi[] = [
  { label: "Fuel Efficiency", value: "8.4 km/l" },
  { label: "Fleet Utilization", value: "81%" },
  { label: "Operational Cost", value: 34070 },
  { label: "Vehicle ROI", value: "14.2%" },
];

export const monthlyRevenue: RevenuePoint[] = [
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 31000 },
  { month: "Apr", revenue: 29500 },
  { month: "May", revenue: 33000 },
  { month: "Jun", revenue: 36500 },
  { month: "Jul", revenue: 40200 },
];

export const costliestVehicles: CostliestVehicle[] = [
  { vehicle: "TRUCK-11", cost: 24500 },
  { vehicle: "MINI-03", cost: 9200 },
  { vehicle: "VAN-05", cost: 4100 },
];
