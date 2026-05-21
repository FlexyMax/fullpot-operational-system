"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => ReactNode;
}

interface TabTableProps {
  loading: boolean;
  rows: any[];
  empty: string;
  columns: Column[];
  selectedIdx?: number;
  onSelectIdx?: (idx: number) => void;
  actions?: (row: any) => ReactNode;
}

export function TabTable({ loading, rows, empty, columns, selectedIdx, onSelectIdx, actions }: TabTableProps) {
  return (
    <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#374151] border-b text-white font-bold sticky top-0 z-10">
          <tr>
            {columns.map((col, i) => (
              <th key={col.key + i} className={cn("p-2 border-r border-gray-600/50 whitespace-nowrap", col.className)}>
                {col.label}
              </th>
            ))}
            {actions && <th className="p-2 w-[120px] text-center border-l border-gray-600/50">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-400">Loading...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-400 italic">{empty}</td></tr>
          ) : (
            rows.map((row, i) => {
              const active = selectedIdx === i;
              return (
                <tr
                  key={i}
                  onClick={() => onSelectIdx?.(i)}
                  className={cn(
                    "border-b transition-colors",
                    onSelectIdx ? "cursor-pointer" : "",
                    active ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                  )}
                >
                  {columns.map((col, j) => (
                    <td key={j} className={cn("p-2 border-r border-gray-100 truncate max-w-[200px]", col.className)}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-1 border-l border-gray-100 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
