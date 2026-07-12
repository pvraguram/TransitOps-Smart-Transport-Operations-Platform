import { useState, useEffect } from "react";
import { Car, Plus, Search, X } from "lucide-react";
import { vehicleApi } from "../services/api";


function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    on_trip: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    in_shop: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    retired: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [newRegNo, setNewRegNo] = useState("");
  const [newNameModel, setNewNameModel] = useState("");
  const [newType, setNewType] = useState("Van");
  const [newCapacity, setNewCapacity] = useState("");
  const [newCost, setNewCost] = useState("");

  const loadVehicles = async () => {
    try {
      const res = await vehicleApi.getAll();
      setVehicles(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name_model?.toLowerCase().includes(search.toLowerCase()) ||
      v.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newRegNo.trim()) errors.regNo = "Registration number is required.";
    if (!newNameModel.trim()) errors.nameModel = "Model / Name is required.";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setSaving(true);
    try {
      await vehicleApi.create({
        registration_number: newRegNo,
        name_model: newNameModel,
        type: newType,
        max_load_capacity: Number(newCapacity) || 0,
        acquisition_cost: Number(newCost) || 0,
      });
      loadVehicles();
      setShowAddVehicle(false);
      setNewRegNo("");
      setNewNameModel("");
      setNewType("Van");
      setNewCapacity("");
      setNewCost("");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
            placeholder="Search by model, reg no..."
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
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="in_shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
              <th className="px-5 py-3">Registration No.</th>
              <th className="px-5 py-3">Model / Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Capacity (kg)</th>
              <th className="px-5 py-3">Odometer</th>
              <th className="px-5 py-3">Real Cost (₹)</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr key={v.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">{v.registration_number}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.name_model}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.type}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.max_load_capacity}</td>
                <td className="px-5 py-3 text-[#451952]/80">{v.odometer?.toLocaleString()} km</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{v.acquisition_cost?.toLocaleString()}</td>
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
        <div
          className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddVehicle(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
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
                  Registration No.
                </label>
                <input
                  value={newRegNo}
                  onChange={(e) => { setNewRegNo(e.target.value); setFormErrors(p => ({ ...p, regNo: "" })); }}
                  placeholder="e.g. MH-12-AB-1234"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 ${formErrors.regNo ? "border-red-400" : "border-[#662549]/20"}`}
                />
                {formErrors.regNo && <p className="text-xs text-red-500 mt-1">{formErrors.regNo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Model / Name
                </label>
                <input
                  value={newNameModel}
                  onChange={(e) => { setNewNameModel(e.target.value); setFormErrors(p => ({ ...p, nameModel: "" })); }}
                  placeholder="e.g. Tata Ace Gold"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 ${formErrors.nameModel ? "border-red-400" : "border-[#662549]/20"}`}
                />
                {formErrors.nameModel && <p className="text-xs text-red-500 mt-1">{formErrors.nameModel}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="MXD">MXD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Capacity (kg)
                </label>
                <input
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  type="number"
                  placeholder="e.g. 4000"
                  className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                  Real Cost (₹)
                </label>
                <input
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
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
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#F39F5A] text-[#1D1A39] hover:brightness-95 disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
