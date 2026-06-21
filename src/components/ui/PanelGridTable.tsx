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
        "w-full border-collapse text-left text-[13px] font-normal",
        "border border-[#DBD9D9]",
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
      <tr className="bg-[#4F4F4F]">{children}</tr>
    </thead>
  );
}

export function PanelGridTh({
  children,
  className,
  align = "left",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  onClick?: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "bg-[#4F4F4F] text-white",
        "px-2 py-[6px] font-bold uppercase text-[12px] whitespace-nowrap",
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
  style,
  onClick,
  onDoubleClick,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onDoubleClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      className={cn(
        "border-b border-[#DBD9D9] transition-colors cursor-pointer",
        selected ? "bg-[#FB7506]/10 hover:bg-[#FB7506]/15" : "hover:bg-gray-50 bg-white",
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
        "px-2 py-1 text-[13px] font-normal text-gray-700 whitespace-nowrap",
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
    <tfoot className="bg-gray-100 border-t-2 border-[#DBD9D9] sticky bottom-0 z-10">
      {children}
    </tfoot>
  );
}
