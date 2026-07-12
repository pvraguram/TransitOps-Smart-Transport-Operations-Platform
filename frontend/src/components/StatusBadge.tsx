interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

const variantStyles: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  warning: "bg-[#F39F5A]/20 text-[#F39F5A] border border-[#F39F5A]/40",
  danger: "bg-[#AE445A]/15 text-[#AE445A] border border-[#AE445A]/30",
  info: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  neutral: "bg-[#451952]/10 text-[#451952] border border-[#451952]/30",
};

// Auto-maps common status strings to a variant if none is passed explicitly
const autoVariant = (status: string): keyof typeof variantStyles => {
  const s = status.toLowerCase();
  if (["available", "completed", "active"].includes(s)) return "success";
  if (["on trip", "enroute", "dispatched"].includes(s)) return "info";
  if (["in shop", "pending", "suspended"].includes(s)) return "warning";
  if (["retired", "awaiting vehicle", "cancelled", "off duty"].includes(s)) return "danger";
  return "neutral";
};

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = variant ?? autoVariant(status);
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${variantStyles[resolved]}`}
    >
      {status}
    </span>
  );
}
