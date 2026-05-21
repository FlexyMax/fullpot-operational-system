"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Download, ChevronDown } from "lucide-react";
import { ReactNode as RN } from "react";

export interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => RN;
}

interface TabTableProps {
  loading: boolean;
  rows: any[];
  empty: string;
  columns: Column[];
  selectedIdx?: number;
  onSelectIdx?: (idx: number) => void;
  actions?: (row: any) => RN;
  showToolbar?: boolean;
  onSearch?: (val: string) => void;
  /** Pass to enable download buttons. CSV handler provided by parent; Excel is built-in from table data. */
  onDownload?: () => void;
  /** Filename for the Excel export (without extension). Defaults to "export". */
  exportFilename?: string;
}

function downloadExcel(rows: any[], columns: Column[], filename: string) {
  if (!rows.length) return;
  const headers = columns.map(c => c.label);
  const keys    = columns.map(c => c.key);
  const html = [
    '<table border="1">',
    `<tr>${headers.map(h => `<th><b>${h}</b></th>`).join("")}</tr>`,
    ...rows.map(r => `<tr>${keys.map(k => `<td>${r[k] ?? ""}</td>`).join("")}</tr>`),
    "</table>",
  ].join("");
  const blob = new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${filename}.xls` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function TabTable({
  loading, rows, empty, columns, selectedIdx, onSelectIdx,
  actions, showToolbar, onSearch, onDownload, exportFilename = "export",
}: TabTableProps) {
  const [dlOpen,  setDlOpen]  = useState(false);
  const dlRef                  = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!dlOpen) return;
    function h(e: MouseEvent) {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setDlOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dlOpen]);

  // Internal search filtering when parent doesn't provide onSearch
  const filteredRows = useMemo(() => {
    if (!searchTerm || onSearch) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row: any) =>
      columns.some(col => String(row[col.key] ?? "").toLowerCase().includes(term))
    );
  }, [rows, searchTerm, onSearch, columns]);

  const displayRows = onSearch ? rows : filteredRows;

  // Default CSV download handler
  const handleCsvDownload = () => {
    if (!displayRows.length) return;
    const headers = columns.map(c => c.label).join(",");
    const lines = displayRows.map((r: any) =>
      columns.map(c => {
        const val = String(r[c.key] ?? "").replace(/"/g, String.fromCharCode(34, 34));
        return `"${val}"`;
      }).join(",")
    );
    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `${exportFilename}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {showToolbar && (
        <div className="h-9 border-b border-gray-200 flex items-center px-3 gap-4 shrink-0 bg-white justify-between">
          {/* Search */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search..."
              className="outline-none text-[11px] w-40 text-black placeholder-gray-400"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                onSearch?.(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Record count */}
            {!loading && (
              <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                {displayRows.length} Record{displayRows.length !== 1 ? "s" : ""}
              </span>
            )}

            {/* Download dropdown */}
            <div className="relative" ref={dlRef}>
              <button
                onClick={() => setDlOpen(v => !v)}
                className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-black font-semibold border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                <Download size={12} />
                Download
                <ChevronDown size={10} />
              </button>
              {dlOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50 text-[11px]">
                  <button
                    onClick={() => { (onDownload || handleCsvDownload)(); setDlOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Download as CSV
                  </button>
                  <button
                    onClick={() => { downloadExcel(displayRows, columns, exportFilename); setDlOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Download as Excel
                  </button>
                </div>
              )}
            </div>
          </div>
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
              {actions && <th className="p-2 w-[100px] text-center border-l border-gray-600/50">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : displayRows.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-400 italic">{empty}</td></tr>
            ) : (
              displayRows.map((row, i) => {
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
                        <div className="flex items-center justify-center gap-1">{actions(row)}</div>
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
