"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Power, type LucideIcon } from "lucide-react";

interface AppHeaderProps {
  title: string;
  icon?: LucideIcon;
  showBack?: boolean;
  backHref?: string;
  useBack?: boolean;
  extraRight?: React.ReactNode;
}

function getInitials(name?: string | null) {
  if (!name) return "OP";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader({
  title,
  icon: Icon,
  showBack = true,
  backHref = "/menu",
  useBack = false,
  extraRight,
}: AppHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="h-16 bg-[#333030] flex items-center justify-between px-3 md:px-6 shrink-0 text-white">
      <div className="flex items-center gap-2 md:gap-3">
        {showBack && (
          <button
            onClick={() => useBack ? router.back() : router.push(backHref)}
            className="hover:bg-white/10 p-1.5 rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        {Icon ? (
          <Icon size={16} className="text-[#FB7506]" />
        ) : (
          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center"
            style={{ background: "#FB7506" }}
          >
            <span className="text-white font-black text-[10px] md:text-xs leading-none">
              FOS
            </span>
          </div>
        )}
        <div className="w-px h-4 md:h-5 bg-white/20" />
        <span className="font-bold text-xs md:text-sm uppercase tracking-tight truncate max-w-[140px] sm:max-w-none">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">User:</span>
          <span className="text-white max-w-[220px] truncate">
            {session?.user?.name || "OPERATOR"}
          </span>
        </div>
        <div
          className="md:hidden w-9 h-9 rounded-full bg-[#FB7506] flex items-center justify-center text-xs font-black text-white"
          title={session?.user?.name || "OPERATOR"}
        >
          {getInitials(session?.user?.name)}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
            Online
          </span>
        </div>
        {extraRight}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Logout"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FB7506] hover:bg-[#ff8c2a] text-white transition-all shadow-sm hover:shadow-md"
        >
          <Power size={14} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
