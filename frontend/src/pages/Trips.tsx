import { useState, useEffect } from "react";
import { Truck, AlertTriangle } from "lucide-react";
import { tripApi, vehicleApi, driverApi } from "../services/api";

type Step = "Create" | "Dispatched" | "Completed" | "Closed";
const steps: Step[] = ["Create", "Dispatched", "Completed", "Closed"];

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    enroute: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    dispatched: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
    completed: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    draft: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function Trips() {
  const [currentStep, setCurrentStep] = useState<Step>("Create");
  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        tripApi.getAll(),
        vehicleApi.getAll(),
        driverApi.getAll()
      ]);
      setLiveTrips(tripsRes.data);
      setAvailableVehicles(vehiclesRes.data.filter((v: any) => v.status === "available"));
      setAvailableDrivers(driversRes.data.filter((d: any) => d.status === "available"));
    } catch (e) {
      console.error("Failed to load data for trips", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedVehicle = availableVehicles.find(v => v.id === Number(vehicleId));
  const vehicleCapacity = selectedVehicle ? selectedVehicle.max_load_capacity : 0;
  const cargoWeightNum = Number(cargoWeight) || 0;
  const capacityExceeded = selectedVehicle && cargoWeightNum > vehicleCapacity;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacityExceeded || !vehicleId || !driverId) return;
    setErrorMsg("");

    try {
      await tripApi.dispatch({
        origin,
        destination,
        vehicle_id: Number(vehicleId),
        driver_id: Number(driverId),
        cargo_weight: cargoWeightNum,
        planned_distance: Number(plannedDistance) || 0
      });
      setCurrentStep("Dispatched");
      handleCancel();
      loadData();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.response?.data?.detail || "Failed to dispatch trip");
    }
  };

  const handleCancel = () => {
    setOrigin("");
    setDestination("");
    setVehicleId("");
    setDriverId("");
    setCargoWeight("");
    setPlannedDistance("");
    setErrorMsg("");
  };

  return (
    <div className="p-6 bg-[#E8BCB9]/10 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D1A39]">Trip Dispatcher</h1>
        <p className="text-sm text-[#662549]/70 mt-0.5">
          Create, assign, and monitor trips in real time
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm p-5 mb-6">
        <div className="flex items-center">
          {steps.map((step, i) => {
            const stepIndex = steps.indexOf(step);
            const currentIndex = steps.indexOf(currentStep);
            const isActive = step === currentStep;
            const isDone = stepIndex < currentIndex;

            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "bg-[#451952] text-white"
                        : isActive
                        ? "bg-[#F39F5A] text-[#1D1A39]"
                        : "bg-[#E8BCB9]/40 text-[#662549]/50"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1D1A39]" : "text-[#662549]/60"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-3 rounded ${
                      isDone ? "bg-[#451952]" : "bg-[#E8BCB9]/60"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* Create Trip Form */}
        <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm p-6 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#F39F5A]/20 flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#F39F5A]" />
            </div>
            <h2 className="font-semibold text-[#1D1A39]">Create Trip</h2>
          </div>

          <form onSubmit={handleDispatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Origin</label>
              <input required value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Anantnagar Depot" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Destination</label>
              <input required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Anandabad Hub" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Vehicle (Available Only)</label>
              <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white">
                <option value="">Select vehicle</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registration_number} — {v.max_load_capacity} kg capacity</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Driver (Available Only)</label>
              <select required value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40 bg-white">
                <option value="">Select driver</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Cargo Weight (kg)</label>
              <input required value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} type="number" placeholder="0" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Planned Distance (km)</label>
              <input required value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} type="number" placeholder="0" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-[#AE445A]/10 border border-[#AE445A]/30 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-[#AE445A] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#AE445A]">{errorMsg}</p>
              </div>
            )}

            {capacityExceeded && (
              <div className="flex items-start gap-2 bg-[#AE445A]/10 border border-[#AE445A]/30 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-[#AE445A] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#AE445A]">
                  Vehicle capacity {vehicleCapacity} kg exceeded. Cargo weight {cargoWeightNum} kg.
                  <br />
                  Capacity exceeded by {cargoWeightNum - vehicleCapacity} kg — dispatch blocked.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCancel} className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-[#662549]/20 text-[#451952] hover:bg-[#E8BCB9]/20">
                Cancel
              </button>
              <button type="submit" disabled={capacityExceeded} className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#F39F5A] text-[#1D1A39] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Dispatch/Assign
              </button>
            </div>
          </form>
        </div>

        {/* Live Board */}
        <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-[#662549]/10">
            <h2 className="font-semibold text-[#1D1A39]">Live Board</h2>
          </div>
          <div className="divide-y divide-[#662549]/10">
            {liveTrips.length === 0 ? (
              <div className="p-8 text-center text-[#662549]/50">No active trips found.</div>
            ) : (
              liveTrips.map((trip) => (
                <div key={trip.id} className="px-5 py-4 hover:bg-[#E8BCB9]/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1D1A39]">
                        TR-{trip.id}: {trip.origin} → {trip.destination}
                      </p>
                      <p className="text-xs text-[#662549]/70 mt-1">Vehicle ID: {trip.vehicle_id} / Driver ID: {trip.driver_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <StatusPill status={trip.status} />
                      <span className="text-xs text-[#662549]/60">{trip.planned_distance} km</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
