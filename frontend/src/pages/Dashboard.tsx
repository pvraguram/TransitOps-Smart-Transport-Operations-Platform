// src/pages/Dashboard.tsx
import { useMemo, useState } from "react";
import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { dashboardKpis, recentTrips, vehicleStatusBreakdown } from "../data/mockData";
import type { RecentTrip } from "../types";

function FilterSelect({ label }: { label: string }) {
  return (
    <select className="text-sm border border-[#662549]/30 rounded-lg px-3 py-1.5 bg-white text-[#1D1A39] focus:outline-none focus:ring-2 focus:ring-[#F39F5A]">
      <option>{label}: All</option>
    </select>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");

  const totalVehicles = useMemo(
    () => vehicleStatusBreakdown.reduce((sum, v) => sum + v.count, 0),
    []
  );

  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-72 text-sm border border-[#662549]/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F39F5A]"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <FilterSelect label="Vehicle Type" />
        <FilterSelect label="Status" />
        <FilterSelect label="Region" />
      </div>

      {/* KPI row */}
      <div className="flex flex-wrap gap-4">
        {dashboardKpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Bottom split: Recent Trips + Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips table */}
        <div className="lg:col-span-2 space-y-0">
          <div className="px-4 py-3 bg-[#1D1A39] rounded-t-xl">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              RECENT TRIPS
            </h3>
          </div>
          <DataTable<RecentTrip>
  data={recentTrips}
  keyField="id"
  columns={[
    { key: "trip", header: "Trip", render: (t) => <span className="font-medium text-[#1D1A39]">{t.id}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (t) => t.vehicle },
    { key: "driver", header: "Driver", accessor: (t) => t.driver },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    { key: "eta", header: "ETA", render: (t) => <span className="text-[#451952]/70">{t.eta}</span> },
  ]}
/>
        </div>

        {/* Vehicle Status breakdown */}
        <div className="bg-white border border-[#E8BCB9] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#1D1A39] tracking-wide mb-4">
            VEHICLE STATUS
          </h3>
          <div className="space-y-4">
            {vehicleStatusBreakdown.map((v) => {
              const pct = Math.round((v.count / totalVehicles) * 100);
              return (
                <div key={v.label}>
                  <div className="flex justify-between text-xs text-[#1D1A39] mb-1">
                    <span>{v.label}</span>
                    <span className="font-medium">{v.count}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E8BCB9]/40">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: v.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}