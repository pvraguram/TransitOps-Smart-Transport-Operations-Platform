// src/components/KpiCard.tsx
import type { Kpi } from "../types";

interface KpiCardProps {
  kpi: Kpi;
}

export default function KpiCard({ kpi }: KpiCardProps) {
  const valueColor =
    kpi.accent === "rose" ? "text-[#AE445A]" :
    kpi.accent === "orange" ? "text-[#F39F5A]" :
    kpi.accent === "wine" ? "text-[#662549]" :
    "text-[#1D1A39]";

  return (
    <div className="bg-[#E8BCB9]/25 border border-[#E8BCB9] rounded-xl px-4 py-3 flex-1 min-w-[150px]">
      <p className="text-xs uppercase tracking-wide text-[#451952]/70 font-medium">
        {kpi.label}
      </p>
      <p className={`text-2xl font-semibold mt-1 ${valueColor}`}>{kpi.value}</p>
    </div>
  );
}
