"use client";

import { cn } from "@/lib/utils";

/* ─── Reusable table styled like the reference POS grid ─────────────────── */

export interface PanelGridTableProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelGridTable({ children, className }: PanelGridTableProps) {
  return (
    <table
      className={cn(
        "w-full border-collapse text-left",
        "border border-black/5",
        className
      )}
    >
      {children}
    </table>
  );
}

export function PanelGridThead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10">
      <tr className="border-b-2 border-gray-200">{children}</tr>
    </thead>
  );
}

export function PanelGridTh({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={cn(
        "bg-white text-gray-500 border border-black/5 border-b-2 border-b-gray-200",
        "px-2 py-[6px] font-black uppercase text-[10px] whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </th>
  );
}

export function PanelGridTbody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function PanelGridTr({
  children,
  className,
  selected = false,
  onClick,
  onDoubleClick,
}: {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "h-8 transition-colors text-gray-700 cursor-pointer",
        "border-b border-black/5",
        selected
          ? "!bg-blue-100 ring-2 ring-inset ring-blue-300 z-10 relative"
          : "hover:bg-blue-50/50 even:bg-black/[0.02]",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function PanelGridTd({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-2 py-1 text-[11px] text-gray-700 whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
}
