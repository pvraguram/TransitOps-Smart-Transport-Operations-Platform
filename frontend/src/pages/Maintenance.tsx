import { useState, useEffect } from "react";
import { Wrench, Save, ArrowRight } from "lucide-react";
import { maintenanceApi, vehicleApi } from "../services/api";

type Status = "in_shop" | "completed" | "available";

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    in_shop: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    completed: "bg-[#451952]/10 text-[#451952] border border-[#451952]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function Maintenance() {
  const [serviceLogs, setServiceLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");

  const loadData = async () => {
    try {
      const [maintRes, vehRes] = await Promise.all([
        maintenanceApi.getAll(),
        vehicleApi.getAll()
      ]);
      setServiceLogs(maintRes.data);
      setVehicles(vehRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !serviceType || !cost) return;

    try {
      await maintenanceApi.create({
        vehicle_id: Number(vehicleId),
        service_type: serviceType,
        cost: Number(cost),
        description: description || null
      });
      setVehicleId("");
      setServiceType("");
      setCost("");
      setDescription("");
      loadData();
    } catch (e) {
      console.error("Failed to add maintenance record", e);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await maintenanceApi.update(id.toString(), { status: "completed" });
      loadData();
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  return (
    <div className="p-6 bg-[#E8BCB9]/10 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D1A39]">Maintenance</h1>
        <p className="text-sm text-[#662549]/70 mt-0.5">
          Log service records and track vehicle status through repair
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Log Service Record Form */}
        <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm p-6 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#F39F5A]/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-[#F39F5A]" />
            </div>
            <h2 className="font-semibold text-[#1D1A39]">Log Service Record</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Vehicle
              </label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registration_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Service Type
              </label>
              <input
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g. Oil Change"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Cost (₹)
              </label>
              <input
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Description (Optional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#F39F5A] text-[#1D1A39] font-semibold text-sm py-2.5 rounded-lg hover:brightness-95 transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </form>

          {/* Status Flow Diagram */}
          <div className="mt-6 pt-5 border-t border-[#662549]/10">
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                Available
              </span>
              <ArrowRight className="w-4 h-4 text-[#662549]/50" />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40">
                In Shop
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40">
                In Shop
              </span>
              <ArrowRight className="w-4 h-4 text-[#662549]/50" />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                Available
              </span>
            </div>
            <p className="text-xs text-[#AE445A] mt-3">
              Note: In Shop vehicles are removed from the dispatch pool.
            </p>
          </div>
        </div>

        {/* Service Log Table */}
        <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-[#662549]/10">
            <h2 className="font-semibold text-[#1D1A39]">Service Log</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
                <th className="px-5 py-3">Vehicle ID</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Cost (₹)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceLogs.map((log) => (
                <tr key={log.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                  <td className="px-5 py-3 font-medium text-[#1D1A39]">{log.vehicle_id}</td>
                  <td className="px-5 py-3 text-[#451952]/80">{log.service_type}</td>
                  <td className="px-5 py-3 font-semibold text-[#1D1A39]">
                    ₹{log.cost.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={log.status} />
                  </td>
                  <td className="px-5 py-3">
                    {log.status === 'in_shop' && (
                      <button onClick={() => handleComplete(log.id)} className="text-xs text-blue-600 underline">
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
