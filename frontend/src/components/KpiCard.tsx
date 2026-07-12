import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  emphasis?: boolean; // dark variant, e.g. for a "total" card
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  emphasis = false,
}: KpiCardProps) {
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-500"
      : trendDirection === "down"
      ? "text-[#AE445A]"
      : "text-[#662549]/60";

  if (emphasis) {
    return (
      <div className="bg-[#1D1A39] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#F39F5A] text-xs font-semibold uppercase">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </div>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {trend && <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#662549]/15 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#662549]/70 text-xs font-semibold uppercase">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <p className="text-2xl font-bold text-[#1D1A39] mt-2">{value}</p>
      {trend && <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>}
    </div>
  );
}
