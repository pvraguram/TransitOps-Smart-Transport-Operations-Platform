// src/pages/Drivers.tsx
import { useMemo, useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { driverApi } from "../services/api";
import { X, UserPlus } from "lucide-react";

export default function Drivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [category, setCategory] = useState("LMV");
  const [expiry, setExpiry] = useState("");
  const [contact, setContact] = useState("");

  const filterChips = ["available", "on_trip", "off_duty", "suspended"];

  const loadDrivers = async () => {
    try {
      const res = await driverApi.getAll();
      setDrivers(res.data);
    } catch (e) {
      console.error("Failed to load drivers", e);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const name = `${d.first_name} ${d.last_name}`;
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        d.license_number?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || d.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, drivers]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await driverApi.create({
        first_name: firstName,
        last_name: lastName,
        license_number: licenseNo,
        license_category: category,
        license_expiry_date: expiry,
        contact_number: contact,
      });
      setShowAddModal(false);
      setFirstName("");
      setLastName("");
      setLicenseNo("");
      setCategory("LMV");
      setExpiry("");
      setContact("");
      loadDrivers();
    } catch (e) {
      console.error("Failed to add driver", e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search + Add Driver */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, license..."
          className="w-72 text-sm border border-[#662549]/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F39F5A]"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#F39F5A] hover:bg-[#e8944f] text-[#1D1A39] font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Drivers table */}
      <DataTable<any>
        data={filteredDrivers}
        keyField="id"
        emptyMessage="No drivers match your search/filter."
        columns={[
          { key: "name", header: "Driver", render: (d) => <span className="font-medium text-[#1D1A39]">{d.first_name} {d.last_name}</span> },
          { key: "licenseNo", header: "License No.", accessor: (d) => d.license_number },
          { key: "category", header: "Category", accessor: (d) => d.license_category },
          {
            key: "expiry",
            header: "Expiry",
            render: (d) => {
              const isExpired = new Date(d.license_expiry_date) < new Date();
              return (
                <span className={isExpired ? "text-[#AE445A] font-medium" : "text-[#1D1A39]"}>
                  {d.license_expiry_date}{isExpired ? " (EXPIRED)" : ""}
                </span>
              );
            },
          },
          { key: "contact", header: "Contact", render: (d) => <span className="text-[#451952]/70">{d.contact_number}</span> },
          { key: "safety", header: "Safety Score", render: (d) => <span className="font-medium text-[#1D1A39]">{d.safety_score}%</span> },
          { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
        ]}
      />

      {/* Toggle status filter chips */}
      <div className="flex gap-2">
        {(["All", ...filterChips]).map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
              activeFilter === chip
                ? "bg-[#1D1A39] text-white border-[#1D1A39]"
                : "bg-white text-[#1D1A39] border-[#662549]/30 hover:border-[#F39F5A]"
            }`}
          >
            {chip.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Business rule note */}
      <p className="text-xs text-[#AE445A] font-medium">
        Rule: Expired license or Suspended status → blocked from trip assignment.
      </p>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1D1A39]">Add New Driver</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#662549]/50 hover:text-[#662549]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">First Name</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Last Name</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">License No.</label>
                <input required value={licenseNo} onChange={e => setLicenseNo(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg bg-white">
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                    <option value="Two Wheeler">Two Wheeler</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Expiry Date</label>
                  <input required type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Contact Number</label>
                <input required value={contact} onChange={e => setContact(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#662549]/20 rounded-lg" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-sm font-semibold rounded-lg border border-[#662549]/20 text-[#451952] hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#F39F5A] text-[#1D1A39]">
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}