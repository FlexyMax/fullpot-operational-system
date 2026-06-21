"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GridMenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "green" | "orange" | "red" | "blue" | "gray" | "amber" | "purple";
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

const ITEM_COLORS: Record<string, string> = {
  green:  "text-green-600",
  orange: "text-[#FB7506]",
  red:    "text-red-500",
  blue:   "text-blue-600",
  gray:   "text-gray-600",
  amber:  "text-amber-500",
  purple: "text-purple-500",
};

export function GridMenu({
  items,
  disabled: globalDisabled,
}: {
  items: GridMenuItem[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={toggle}
        disabled={globalDisabled}
        className="h-10 bg-[#FB7506] hover:bg-orange-600 text-white w-24 flex items-center justify-center transition-colors border-none cursor-pointer shadow-inner rounded-tr-lg disabled:opacity-50"
        title="Menu"
      >
        <Menu size={20} />
      </button>
      {mounted && open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 100, minWidth: 220, maxWidth: 320 }}
          className="bg-white border border-gray-200 rounded-sm shadow-xl py-1 overflow-hidden divide-y divide-black/5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex flex-col max-h-[70vh] overflow-y-auto">
            {items.map((item, i) => {
              if (item.separator) {
                return <div key={`sep-${i}`} className="border-t border-gray-100" />;
              }
              const isDisabled = !!item.disabled || !!globalDisabled;
              const colorClass = ITEM_COLORS[item.color] || ITEM_COLORS.gray;
              return (
                <button
                  key={`${item.label}-${i}`}
                  onClick={() => {
                    if (!isDisabled) {
                      item.onClick();
                      setOpen(false);
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold uppercase transition-colors text-left",
                    isDisabled ? "opacity-40 cursor-not-allowed text-gray-400" : "hover:bg-[#FB7506]/10"
                  )}
                >
                  <item.icon size={16} className={cn("shrink-0", isDisabled ? "text-gray-300" : colorClass)} />
                  <span className={isDisabled ? "text-gray-400" : colorClass}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
