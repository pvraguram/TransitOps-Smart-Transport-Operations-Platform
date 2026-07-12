
// src/components/StatusBadge.tsx
import type {
  TripStatus,
  DutyStatus,
  SafetyStatus,
  VehicleState,
  MaintenanceStatus,
  ExpenseStatus,
} from "../types";

type AnyStatus =
  | TripStatus
  | DutyStatus
  | SafetyStatus
  | VehicleState
  | MaintenanceStatus
  | ExpenseStatus;

// Central palette-driven style map — every status string used across
// Dashboard, Drivers, Trips, Vehicles, Maintenance, Expenses lives here.
const statusStyles: Record<string, string> = {
  // Positive / neutral-good states
  "Available": "bg-[#F39F5A]/20 text-[#1D1A39] border border-[#F39F5A]",
  "Completed": "bg-[#F39F5A]/20 text-[#1D1A39] border border-[#F39F5A]",
  "Active": "bg-[#F39F5A]/20 text-[#1D1A39] border border-[#F39F5A]",

  // In-progress states
  "On Trip": "bg-[#662549] text-white",
  "Dispatched": "bg-[#F39F5A] text-[#1D1A39]",

  // Neutral / idle states
  "Off Duty": "bg-gray-200 text-gray-600",
  "Draft": "bg-gray-200 text-gray-600",

  // Alert / blocked states
  "Suspended": "bg-[#AE445A] text-white",
  "Cancelled": "bg-[#AE445A] text-white",
  "In Shop": "bg-[#AE445A] text-white",
  "Retired": "bg-[#1D1A39] text-white",
};

const fallbackStyle = "bg-gray-100 text-gray-700 border border-gray-300";

interface StatusBadgeProps {
  status: AnyStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = statusStyles[status] ?? fallbackStyle;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block whitespace-nowrap ${styles} ${className}`}
    >
      {status}
    </span>
  );
}