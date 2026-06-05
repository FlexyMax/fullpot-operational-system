"use client";

interface AppFooterProps {
  areaLabel?: string;
  database?: string;
  showVersion?: boolean;
}

export function AppFooter({
  areaLabel = "Operational System",
  database = "FullPot",
  showVersion = true,
}: AppFooterProps) {
  return (
    <footer className="h-10 bg-[#000000] px-4 md:px-6 flex items-center justify-center md:justify-between text-[11px] font-bold uppercase tracking-tight shrink-0">
      <div className="hidden md:flex items-center gap-4 text-white/60">
        <span>Server: Production</span>
        <span className="text-white/20">|</span>
        <span>Database: {database}</span>
      </div>
      <span className="text-white/90 tracking-[0.14em]">
        FlexyMax ® {new Date().getFullYear()}
      </span>
      {showVersion && (
        <span className="hidden md:inline text-[#FB7506]">
          FOS {areaLabel} V.2.0.1
        </span>
      )}
    </footer>
  );
}
