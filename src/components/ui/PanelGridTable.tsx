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
  onClick,
  onDoubleClick,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "border-b border-black/5 transition-colors cursor-pointer",
        selected ? "bg-blue-50 hover:bg-blue-100/80" : "hover:bg-black/5 bg-white",
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

export function PanelGridTfoot({ children }: { children: React.ReactNode }) {
  return (
    <tfoot className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0 z-10">
      {children}
    </tfoot>
  );
}
