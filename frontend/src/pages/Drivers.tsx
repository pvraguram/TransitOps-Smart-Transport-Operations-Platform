// src/pages/Drivers.tsx
import { useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { drivers } from "../data/mockData";
import type { Driver, DutyStatus } from "../types";

export default function Drivers() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<DutyStatus | "All">("All");

  const filterChips: DutyStatus[] = ["Available", "On Trip", "Off Duty", "Suspended"];

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNo.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || d.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Search + Add Driver */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-72 text-sm border border-[#662549]/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F39F5A]"
        />
        <button className="bg-[#F39F5A] hover:bg-[#e8944f] text-[#1D1A39] font-medium text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Driver
        </button>
      </div>

      {/* Drivers table */}
      <DataTable<Driver>
  data={filteredDrivers}
  keyField="id"
  emptyMessage="No drivers match your search/filter."
  columns={[
    { key: "name", header: "Driver", render: (d) => <span className="font-medium text-[#1D1A39]">{d.name}</span> },
    { key: "licenseNo", header: "License No.", accessor: (d) => d.licenseNo },
    { key: "category", header: "Category", accessor: (d) => d.category },
    {
      key: "expiry",
      header: "Expiry",
      render: (d) => (
        <span className={d.expired ? "text-[#AE445A] font-medium" : "text-[#1D1A39]"}>
          {d.expiry}{d.expired ? " EXPIRED" : ""}
        </span>
      ),
    },
    { key: "contact", header: "Contact", render: (d) => <span className="text-[#451952]/70">{d.contact}</span> },
    { key: "tripCompletion", header: "Trip Compl.", accessor: (d) => `${d.tripCompletion}%` },
    { key: "safety", header: "Safety", render: (d) => <StatusBadge status={d.safety} /> },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ]}
/>

      {/* Toggle status filter chips */}
      <div className="flex gap-2">
        {(["All", ...filterChips] as (DutyStatus | "All")[]).map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === chip
                ? "bg-[#1D1A39] text-white border-[#1D1A39]"
                : "bg-white text-[#1D1A39] border-[#662549]/30 hover:border-[#F39F5A]"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Business rule note */}
      <p className="text-xs text-[#AE445A] font-medium">
        Rule: Expired license or Suspended status → blocked from trip assignment.
      </p>
    </div>
  );
}