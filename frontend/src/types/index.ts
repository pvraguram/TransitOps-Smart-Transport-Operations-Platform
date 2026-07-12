// src/types/index.ts

// ---------- Auth / RBAC ----------
export type UserRole = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ---------- Shared / status enums ----------
export type TripStatus = "On Trip" | "Completed" | "Dispatched" | "Draft" | "Cancelled";
export type DutyStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type SafetyStatus = "Available" | "Suspended";
export type VehicleState = "Available" | "On Trip" | "In Shop" | "Retired";
export type Category = "LMV" | "HMV";
export type MaintenanceStatus = "Active" | "In Shop" | "Completed";
export type ExpenseStatus = "Available" | "Completed";

// ---------- Vehicle ----------
export interface Vehicle {
  id: string;
  regNo: string; // unique
  nameModel: string;
  type: "Van" | "Truck" | "Mini";
  capacity: string; // e.g. "500 kg"
  odometer: number;
  acquisitionCost: number;
  status: VehicleState;
}

// ---------- Driver ----------
export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  category: Category;
  expiry: string;       // display string, e.g. "12/2028"
  expired: boolean;
  contact: string;
  tripCompletion: number; // %
  safety: SafetyStatus;
  status: DutyStatus;
}

// ---------- Trip ----------
export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle?: string;
  driver?: string;
  cargoWeight: number;   // kg
  plannedDistance: number; // km
  status: TripStatus;
  eta: string;
}

// ---------- Maintenance ----------
export interface MaintenanceRecord {
  id: string;
  vehicle: string;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
}

// ---------- Fuel & Expenses ----------
export interface FuelLog {
  id: string;
  vehicle: string;
  date: string;
  liters: number;
  fuelCost: number;
}

export interface ExpenseEntry {
  id: string;
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
  maintLinked: number;
  total: number;
  status: ExpenseStatus;
}

// ---------- Dashboard KPIs ----------
export interface Kpi {
  label: string;
  value: string | number;
  accent?: "orange" | "wine" | "rose" | "default";
}

export interface RecentTrip {
  id: string;
  vehicle: string;
  driver: string;
  status: TripStatus;
  eta: string;
}

export interface VehicleStatusSummary {
  label: VehicleState;
  count: number;
  color: string;
}

// ---------- Analytics ----------
export interface AnalyticsKpi {
  label: string;
  value: string | number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface CostliestVehicle {
  vehicle: string;
  cost: number;
}
