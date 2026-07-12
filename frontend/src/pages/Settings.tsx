import { useState } from "react";
import { User, Lock, Bell, Shield, Save } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");

  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState(user?.email || "admin@transitops.com");
  const [phone, setPhone] = useState("+91 98765 43210");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 bg-[#E8BCB9]/10 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D1A39]">Settings</h1>
        <p className="text-sm text-[#662549]/70 mt-0.5">
          Manage your account preferences and configurations
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm p-3">
            {[
              { id: "Profile", icon: User },
              { id: "Security", icon: Lock },
              { id: "Notifications", icon: Bell },
              { id: "Roles", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 last:mb-0 ${
                    isActive
                      ? "bg-[#F39F5A]/20 text-[#1D1A39]"
                      : "text-[#662549]/70 hover:bg-[#E8BCB9]/20 hover:text-[#1D1A39]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#F39F5A]" : ""}`} />
                  {tab.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl border border-[#662549]/15 shadow-sm p-6">
          {activeTab === "Profile" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-[#1D1A39] mb-4">Profile Information</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#451952] flex items-center justify-center text-white text-xl font-bold">
                    {name.charAt(0)}
                  </div>
                  <button type="button" className="text-sm text-[#F39F5A] font-semibold hover:underline">
                    Change Avatar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Full Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Phone Number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Role</label>
                    <input disabled value={user?.role || "Administrator"} className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#662549]/10 mt-6">
                  <button type="submit" className="flex items-center gap-2 bg-[#F39F5A] text-[#1D1A39] font-semibold text-sm px-5 py-2.5 rounded-lg hover:brightness-95 transition">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-[#1D1A39] mb-4">Change Password</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#662549] mb-1.5 uppercase">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border border-[#662549]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40" />
                </div>
                <div className="pt-4 border-t border-[#662549]/10 mt-6">
                  <button type="submit" className="flex items-center gap-2 bg-[#1D1A39] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#2b2752] transition">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-[#1D1A39] mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#662549]/10">
                  <div>
                    <p className="font-semibold text-[#1D1A39] text-sm">Trip Dispatches</p>
                    <p className="text-xs text-[#662549]/60">Get notified when a new trip is dispatched.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F39F5A]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#662549]/10">
                  <div>
                    <p className="font-semibold text-[#1D1A39] text-sm">Maintenance Alerts</p>
                    <p className="text-xs text-[#662549]/60">Get notified when a vehicle needs maintenance.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F39F5A]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-[#1D1A39] text-sm">Daily Summary Report</p>
                    <p className="text-xs text-[#662549]/60">Receive an email summary of the day's operations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F39F5A]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Roles" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-[#1D1A39] mb-4">Roles & Permissions</h2>
              <p className="text-sm text-[#662549]/70 mb-4">
                You are currently logged in as <strong>{user?.role || "Administrator"}</strong>.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">
                  Role management is restricted. Please contact your system administrator to modify access levels or add new users.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
