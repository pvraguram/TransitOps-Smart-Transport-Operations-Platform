import { useState } from "react";
import { Car, Plus, Search, X } from "lucide-react";

// ---- Palette ----
// #1D1A39 - deep navy
// #451952 - deep purple
// #662549 - wine
// #AE445A - rose
// #F39F5A - orange
// #E8BCB9 - blush

type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
type VehicleType = "Van" | "Truck" | "MXD";

interface Vehicle {
  id: string;
  fuelNoStandard: string;
  ownership: string;
  type: VehicleType;
  capacity: string;
  dispatcher: number;
  realCost: number;
  status: VehicleStatus;
}

const initialVehicles: Vehicle[] = [
  { id: "1", fuelNoStandard: "6TOU82H1H", ownership: "VAN-05", type: "Van", capacity: "200 kg", dispatcher: 34000, realCost: 660000, status: "Available" },
  { id: "2", fuelNoStandard: "6TOU8449T", ownership: "TRUCK-8", type: "Truck", capacity: "8 Ton", dispatcher: 182000, realCost: 2480000, status: "On Trip" },
  { id: "3", fuelNoStandard: "6TOU8260", ownership: "MXD-03", type: "MXD", capacity: "1 Ton", dispatcher: 64000, realCost: 410000, status: "In Shop" },
  { id: "4", fuelNoStandard: "6TOU8009F", ownership: "VAN-09", type: "Van", capacity: "150 kg", dispatcher: 24900, realCost: 540000, status: "Retired" },
];

function StatusPill({ status }: { status: VehicleStatus }) {
  const styles: Record<VehicleStatus, string> = {
    Available: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    "On Trip": "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    "In Shop": "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    Retired: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [newOwnership, setNewOwnership] = useState("");
  const [newType, setNewType] = useState<VehicleType>("Van");
  const [newCapacity, setNewCapacity] = useState("");
  const [newFuelNoStandard, setNewFuelNoStandard] = useState("");
  const [newRealCost, setNewRealCost] = useState("");

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.ownership.toLowerCase().includes(search.toLowerCase()) ||
      v.fuelNoStandard.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnership || !newCapacity) return;

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      fuelNoStandard: newFuelNoStandard || "—",
      ownership: newOwnership,
      type: newType,
      capacity: newCapacity,
      dispatcher: 0,
      realCost: Number(newRealCost) || 0,
      status: "Available",
    };

    setVehicles([newVehicle, ...vehicles]);
    setNewOwnership("");
    setNewType("Van");
    setNewCapacity("");
    setNewFuelNoStandard("");
    setNewRealCost("");
    setShowAddVehicle(false);
  };

  return (
    <div className="p-6 bg-[#E8BCB9]/10 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Vehicle Registry</h1>
          <p className="text-sm text-[#662549]/70 mt-0.5">
            Manage fleet vehicles, capacity, and operational status
          </p>
        </div>
        <button
          onClick={() => setShowAddVehicle(true)}
          className="flex items-center gap-2 bg-[#F39F5A] text-[#1D1A39] font-semibold text-sm px-4 py-2.5 rounded-lg hover:brightness-95 transition"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#662549]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, vehicle..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
        >
          <option value="All">Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="MXD">MXD</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
        >
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
              <th className="px-5 py-3">Fuel No. Standard</th>
              <th className="px-5 py-3">Ownership</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Dispatcher (₹)</th>
              <th className="px-5 py-3">Real Cost (₹)</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr key={v.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">{v.fuelNoStandard}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.ownership}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.type}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.capacity}</td>
                <td className="px-5 py-3 text-[#451952]/80">₹{v.dispatcher.toLocaleString()}</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{v.realCost.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <StatusPill status={v.status} />
                </td>
              </tr>
            ))}
            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[#662549]/50">
                  No vehicles match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#AE445A]">
        Note: Registration must be made — Retired/In Shop vehicles are hidden from the Trip Dispatcher.
      </p>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F39F5A]/20 flex items-center justify-center">
                  <Car className="w-4 h-4 text-[#F39F5A]" />
                </div>
                <h3 className="font-bold text-lg text-[#1D1A39]">Add Vehicle</h3>
              </div>
              <button
                onClick={() => setShowAddVehicle(false)}
                className="text-[#662549]/50 hover:text-[#662549]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Vehicle ID / Ownership
                </label>
                <input
                  value={newOwnership}
                  onChange={(e) => setNewOwnership(e.target.value)}
                  placeholder="e.g. VAN-06"
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="MXD">MXD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Capacity
                </label>
                <input
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="e.g. 400 kg"
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Fuel No. Standard
                </label>
                <input
                  value={newFuelNoStandard}
                  onChange={(e) => setNewFuelNoStandard(e.target.value)}
                  placeholder="e.g. 6TOU82H1H"
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Real Cost (₹)
                </label>
                <input
                  value={newRealCost}
                  onChange={(e) => setNewRealCost(e.target.value)}
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-[#662549]/20 text-[#451952] hover:bg-[#E8BCB9]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#F39F5A] text-[#1D1A39] hover:brightness-95"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
