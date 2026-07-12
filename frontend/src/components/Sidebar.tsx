import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Fleet", icon: Truck, path: "/vehicles" },
  { label: "Drivers", icon: Users, path: "/drivers" },
  { label: "Trips", icon: Route, path: "/trips" },
  { label: "Maintenance", icon: Wrench, path: "/maintenance" },
  { label: "Fuel & Expenses", icon: Fuel, path: "/expenses" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-[#1D1A39] flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#F39F5A]/20 flex items-center justify-center">
          <Truck className="w-4.5 h-4.5 text-[#F39F5A]" fill="#F39F5A" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">TransitOps</p>
          <p className="text-white/40 text-[11px] leading-tight">Smart Transport</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-[#F39F5A] text-[#1D1A39]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#451952] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-white/40 text-[11px] truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
