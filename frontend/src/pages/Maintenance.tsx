import { useState } from "react";
import { Wrench, Save, ArrowRight } from "lucide-react";

// ---- Palette ----
// #1D1A39 - deep navy
// #451952 - deep purple
// #662549 - wine
// #AE445A - rose
// #F39F5A - orange
// #E8BCB9 - blush

type Status = "In Shop" | "Completed" | "Available";

interface ServiceLog {
  id: string;
  vehicle: string;
  service: string;
  cost: number;
  status: Status;
}

const initialServiceLogs: ServiceLog[] = [
  { id: "1", vehicle: "VAN-05", service: "Oil Change", cost: 2600, status: "In Shop" },
  { id: "2", vehicle: "TRUCK-8", service: "Engine Repair", cost: 19000, status: "Completed" },
  { id: "3", vehicle: "MXD-03", service: "Tyre Replace", cost: 6200, status: "In Shop" },
];

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Available: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    "In Shop": "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    Completed: "bg-[#451952]/10 text-[#451952] border border-[#451952]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function Maintenance() {
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>(initialServiceLogs);

  const [vehicle, setVehicle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Status>("In Shop");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !serviceType || !cost) return;

    const newLog: ServiceLog = {
      id: Date.now().toString(),
      vehicle,
      service: serviceType,
      cost: Number(cost),
      status,
    };

    setServiceLogs([newLog, ...serviceLogs]);
    setVehicle("");
    setServiceType("");
    setCost("");
    setDate("");
    setStatus("In Shop");
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
              <input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. VAN-05"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Service Type
              </label>
              <input
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
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Date
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
              >
                <option>In Shop</option>
                <option>Completed</option>
                <option>Available</option>
              </select>
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
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Cost (₹)</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceLogs.map((log) => (
                <tr key={log.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                  <td className="px-5 py-3 font-medium text-[#1D1A39]">{log.vehicle}</td>
                  <td className="px-5 py-3 text-[#451952]/80">{log.service}</td>
                  <td className="px-5 py-3 font-semibold text-[#1D1A39]">
                    ₹{log.cost.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={log.status} />
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
