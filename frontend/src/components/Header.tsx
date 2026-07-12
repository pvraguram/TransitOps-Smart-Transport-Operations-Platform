import { Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  searchPlaceholder?: string;
}

export default function Header({ searchPlaceholder = "Search..." }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 bg-white border-b border-[#662549]/10 px-6 py-3.5 flex-shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#662549]/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#662549]/15 rounded-lg bg-[#E8BCB9]/10 focus:outline-none focus:ring-2 focus:ring-[#F39F5A]/40"
        />
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#451952]/10 text-[#451952] border border-[#451952]/20">
          {user?.role ?? "Guest"}
        </span>
      </div>
    </header>
  );
}
