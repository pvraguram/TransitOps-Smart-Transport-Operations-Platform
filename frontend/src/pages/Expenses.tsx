import { useState } from "react";
import { Fuel, Plus, Receipt, TrendingUp } from "lucide-react";

// ---- Palette ----
// #1D1A39 - deep navy (text/dark bg)
// #451952 - deep purple (sidebar/headers)
// #662549 - wine (accents)
// #AE445A - rose (highlights/danger)
// #F39F5A - orange (primary actions)
// #E8BCB9 - blush (light bg/badges)

type Status = "Available" | "Completed" | "Pending";

interface FuelLog {
  id: string;
  vehicle: string;
  date: string;
  litres: number;
  cost: number;
}

interface OtherExpense {
  id: string;
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
  amountClaimed: number;
  status: Status;
}

const initialFuelLogs: FuelLog[] = [
  { id: "1", vehicle: "VAN-05", date: "05 Jul 2026", litres: 42, cost: 3850 },
  { id: "2", vehicle: "TRUCK-8", date: "06 Jul 2026", litres: 80, cost: 9400 },
  { id: "3", vehicle: "MXD-03", date: "06 Jul 2026", litres: 28, cost: 2950 },
];

const initialOtherExpenses: OtherExpense[] = [
  { id: "1", trip: "TR001", vehicle: "VAN-05", toll: 120, other: 0, amountClaimed: 120, status: "Available" },
  { id: "2", trip: "TR002", vehicle: "TRUCK-8", toll: 340, other: 60, amountClaimed: 18000, status: "Completed" },
];

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Available: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    Completed: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    Pending: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function Expenses() {
  const [fuelLogs] = useState<FuelLog[]>(initialFuelLogs);
  const [otherExpenses] = useState<OtherExpense[]>(initialOtherExpenses);
  const [showLogFuel, setShowLogFuel] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalOtherCost = otherExpenses.reduce((sum, e) => sum + e.amountClaimed, 0);
  const totalOperationalCost = totalFuelCost + totalOtherCost;

  return (
    <div className="p-6 bg-[#E8BCB9]/10 min-h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Fuel & Expense Management</h1>
          <p className="text-sm text-[#662549]/70 mt-0.5">
            Track fuel logs, tolls, and reimbursable trip expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogFuel(true)}
            className="flex items-center gap-2 bg-[#F39F5A] text-[#1D1A39] font-semibold text-sm px-4 py-2.5 rounded-lg hover:brightness-95 transition"
          >
            <Fuel className="w-4 h-4" />
            Log Fuel
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 bg-[#451952] text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-[#662549] transition"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#662549]/15 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#662549]/70 text-xs font-semibold uppercase">
            <Fuel className="w-4 h-4" /> Total Fuel Cost
          </div>
          <p className="text-2xl font-bold text-[#1D1A39] mt-2">₹{totalFuelCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#662549]/15 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#662549]/70 text-xs font-semibold uppercase">
            <Receipt className="w-4 h-4" /> Other Expenses
          </div>
          <p className="text-2xl font-bold text-[#1D1A39] mt-2">₹{totalOtherCost.toLocaleString()}</p>
        </div>
        <div className="bg-[#1D1A39] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#F39F5A] text-xs font-semibold uppercase">
            <TrendingUp className="w-4 h-4" /> Total Operational Cost
          </div>
          <p className="text-2xl font-bold text-white mt-2">₹{totalOperationalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#662549]/10">
          <h2 className="font-semibold text-[#1D1A39]">Fuel Logs</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Litres</th>
              <th className="px-5 py-3">Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((log) => (
              <tr key={log.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">{log.vehicle}</td>
                <td className="px-5 py-3 text-[#451952]/80">{log.date}</td>
                <td className="px-5 py-3 text-[#451952]/80">{log.litres} L</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{log.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other Expenses Table */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#662549]/10">
          <h2 className="font-semibold text-[#1D1A39]">Other Expenses (Toll / Misc)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
              <th className="px-5 py-3">Trip</th>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Toll (₹)</th>
              <th className="px-5 py-3">Other (₹)</th>
              <th className="px-5 py-3">Amount Claimed (₹)</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {otherExpenses.map((exp) => (
              <tr key={exp.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">{exp.trip}</td>
                <td className="px-5 py-3 text-[#451952]/80">{exp.vehicle}</td>
                <td className="px-5 py-3 text-[#451952]/80">₹{exp.toll}</td>
                <td className="px-5 py-3 text-[#451952]/80">₹{exp.other}</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{exp.amountClaimed.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <StatusPill status={exp.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Fuel Modal */}
      {showLogFuel && (
        <div className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-[#1D1A39] mb-4">Log Fuel</h3>
            <div className="space-y-3">
              <input
                placeholder="Vehicle"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Litres"
                type="number"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Cost (₹)"
                type="number"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogFuel(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-[#662549]/20 text-[#451952] hover:bg-[#E8BCB9]/20"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowLogFuel(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#F39F5A] text-[#1D1A39] hover:brightness-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-[#1D1A39] mb-4">Add Expense</h3>
            <div className="space-y-3">
              <input
                placeholder="Trip ID"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Toll (₹)"
                type="number"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Other (₹)"
                type="number"
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-[#662549]/20 text-[#451952] hover:bg-[#E8BCB9]/20"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#451952] text-white hover:bg-[#662549]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
