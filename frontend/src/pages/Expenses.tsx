import { useState, useEffect } from "react";
import { Fuel, Plus, Receipt, TrendingUp } from "lucide-react";
import { expenseApi, vehicleApi, tripApi } from "../services/api";

type Status = "Available" | "Completed" | "Pending";

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Available: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    Completed: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    Pending: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function Expenses() {
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [showLogFuel, setShowLogFuel] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelLitres, setFuelLitres] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  const [expenseTripId, setExpenseTripId] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Toll");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

  const loadData = async () => {
    try {
      const [fuelRes, expRes, vehRes, tripRes] = await Promise.all([
        expenseApi.getFuelLogs(),
        expenseApi.getExpenses(),
        vehicleApi.getAll(),
        tripApi.getAll()
      ]);
      setFuelLogs(fuelRes.data);
      setOtherExpenses(expRes.data);
      setVehicles(vehRes.data);
      setTrips(tripRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveFuel = async () => {
    if (!fuelVehicleId || !fuelLitres || !fuelCost) return;
    try {
      await expenseApi.logFuel({
        vehicle_id: Number(fuelVehicleId),
        litres: Number(fuelLitres),
        cost: Number(fuelCost),
        date: new Date().toISOString()
      });
      setShowLogFuel(false);
      setFuelVehicleId("");
      setFuelLitres("");
      setFuelCost("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseTripId || !expenseAmount) return;
    try {
      await expenseApi.addExpense({
        trip_id: Number(expenseTripId),
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription || null,
        date: new Date().toISOString()
      });
      setShowAddExpense(false);
      setExpenseTripId("");
      setExpenseAmount("");
      setExpenseDescription("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalOtherCost = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
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
              <th className="px-5 py-3">Vehicle ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Litres</th>
              <th className="px-5 py-3">Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((log) => (
              <tr key={log.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">{log.vehicle_id}</td>
                <td className="px-5 py-3 text-[#451952]/80">{new Date(log.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-[#451952]/80">{log.litres} L</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{log.cost.toLocaleString()}</td>
              </tr>
            ))}
            {fuelLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[#662549]/50">No fuel logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Other Expenses Table */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#662549]/10">
          <h2 className="font-semibold text-[#1D1A39]">Other Expenses</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
              <th className="px-5 py-3">Trip ID</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Amount (₹)</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {otherExpenses.map((exp) => (
              <tr key={exp.id} className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10">
                <td className="px-5 py-3 font-medium text-[#1D1A39]">TR-{exp.trip_id}</td>
                <td className="px-5 py-3 text-[#451952]/80">{exp.category}</td>
                <td className="px-5 py-3 text-[#451952]/80">{exp.description || "-"}</td>
                <td className="px-5 py-3 font-semibold text-[#1D1A39]">₹{exp.amount.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <StatusPill status={exp.status} />
                </td>
              </tr>
            ))}
            {otherExpenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#662549]/50">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log Fuel Modal */}
      {showLogFuel && (
        <div className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-[#1D1A39] mb-4">Log Fuel</h3>
            <div className="space-y-3">
              <select
                value={fuelVehicleId}
                onChange={(e) => setFuelVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registration_number}</option>
                ))}
              </select>
              <input
                placeholder="Litres"
                type="number"
                value={fuelLitres}
                onChange={(e) => setFuelLitres(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Cost (₹)"
                type="number"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
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
                onClick={handleSaveFuel}
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
              <select
                value={expenseTripId}
                onChange={(e) => setExpenseTripId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
              >
                <option value="">Select Trip</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>TR-{t.id}: {t.origin} → {t.destination}</option>
                ))}
              </select>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white"
              >
                <option value="Toll">Toll</option>
                <option value="Food">Food</option>
                <option value="Misc">Misc</option>
              </select>
              <input
                placeholder="Amount (₹)"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
              />
              <input
                placeholder="Description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
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
                onClick={handleSaveExpense}
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
