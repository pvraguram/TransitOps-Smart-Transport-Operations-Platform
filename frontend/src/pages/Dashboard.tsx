// src/pages/Dashboard.tsx
import { useMemo, useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { analyticsApi, tripApi, vehicleApi } from "../services/api";
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
  const [stats, setStats] = useState<any>(null);
  const [recentTripsData, setRecentTripsData] = useState<any[]>([]);
  const [vehiclesData, setVehiclesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tripsRes, vehiclesRes] = await Promise.all([
          analyticsApi.getDashboardStats(),
          tripApi.getAll(),
          vehicleApi.getAll()
        ]);
        setStats(statsRes.data);
        setRecentTripsData(tripsRes.data.slice(0, 5)); // show top 5
        setVehiclesData(vehiclesRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const dashboardKpis = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Active Vehicles", value: stats.active_vehicles },
      { label: "Vehicles in Maintenance", value: stats.vehicles_in_maintenance, accent: "rose" },
      { label: "Active Trips", value: stats.active_trips },
      { label: "Pending Trips", value: stats.pending_trips, accent: "orange" },
      { label: "Drivers on Duty", value: stats.drivers_on_duty },
    ];
  }, [stats]);

  const vehicleStatusBreakdown = useMemo(() => {
    const breakdown = [
      { label: "Available", count: 0, color: "#F39F5A", status: "available" },
      { label: "On Trip", count: 0, color: "#662549", status: "on_trip" },
      { label: "In Shop", count: 0, color: "#AE445A", status: "in_shop" },
      { label: "Retired", count: 0, color: "#1D1A39", status: "retired" },
    ];
    vehiclesData.forEach(v => {
      const b = breakdown.find(item => item.status === v.status);
      if (b) b.count += 1;
    });
    return breakdown;
  }, [vehiclesData]);

  const totalVehicles = vehiclesData.length;

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
          <DataTable<any>
  data={recentTripsData}
  keyField="id"
  columns={[
    { key: "trip", header: "Trip", render: (t) => <span className="font-medium text-[#1D1A39]">{t.id}</span> },
    { key: "vehicle", header: "Vehicle", render: (t) => t.vehicle_id },
    { key: "driver", header: "Driver", render: (t) => t.driver_id },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    { key: "eta", header: "Origin - Dest", render: (t) => <span className="text-[#451952]/70">{t.origin} - {t.destination}</span> },
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
              const pct = totalVehicles > 0 ? Math.round((v.count / totalVehicles) * 100) : 0;
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