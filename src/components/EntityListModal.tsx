"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityListModalProps {
  open: boolean;
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  searchPlaceholder?: string;
  listUrl: string;
  renderItem: (item: any) => { primary: string; secondary?: string };
  onClose: () => void;
  onSelect: (item: any) => void;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export function EntityListModal({
  open,
  title,
  icon: Icon,
  searchPlaceholder = "Search...",
  listUrl,
  renderItem,
  onClose,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: EntityListModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(null);
    setLoading(true);
    fetch(`${listUrl}?search=%`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, listUrl]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const r = renderItem(item);
    return (
      r.primary.toLowerCase().includes(q) ||
      (r.secondary?.toLowerCase() || "").includes(q)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 border-b border-black/10">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={16} className="text-[#FB7506] shrink-0" />}
          <span className="fos-grid-header-text truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {loading && <RefreshCcw size={14} className="text-gray-400 animate-spin" />}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#FB7506] bg-gray-50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm font-bold">
            No records found
          </div>
        ) : (
          filtered.map((item, i) => {
            const r = renderItem(item);
            const isSel = selected?.unico === item.unico;
            return (
              <div
                key={item.unico || i}
                onClick={() => {
                  setSelected(item);
                  onSelect(item);
                }}
                className={cn(
                  "px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors",
                  isSel
                    ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                    : "hover:bg-gray-50 border-l-[3px] border-l-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        isSel ? "text-blue-800" : "text-gray-800"
                      )}
                    >
                      {r.primary}
                    </p>
                    {r.secondary && (
                      <p className="text-xs text-gray-400 truncate">
                        {r.secondary}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom action bar */}
      {selected && (
        <div className="h-14 bg-[#374151] flex items-center justify-around shrink-0 border-t border-black/10">
          <button
            onClick={() => onEdit(selected)}
            className="flex flex-col items-center gap-0.5 text-white hover:text-[#FB7506] transition-colors"
          >
            <Pencil size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Edit
            </span>
          </button>
          <button
            onClick={() => onDelete(selected)}
            className="flex flex-col items-center gap-0.5 text-white hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Delete
            </span>
          </button>
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={onAdd}
        className="absolute bottom-4 right-4 w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-[70]"
      >
        <Plus size={22} />
      </button>
    </div>
    </div>
  );
}
