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
  showToolbar?: boolean;
  onSearch?: (val: string) => void;
  onDownload?: () => void;
}

export function TabTable({ loading, rows, empty, columns, selectedIdx, onSelectIdx, actions, showToolbar, onSearch, onDownload }: TabTableProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {showToolbar && (
        <div className="h-9 border-b border-gray-200 flex items-center px-2 gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-1 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search.." 
              className="outline-none text-[11px] w-48 text-black placeholder-gray-400"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          {onDownload && (
            <button onClick={onDownload} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto relative">
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
    </div>
  );
}
