"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  RefreshCcw,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type PanelMenuItem = {
  label?: string;
  icon?: LucideIcon;
  color?: "gray" | "green" | "orange" | "blue" | "red";
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
};

export interface PanelGridProps {
  title: string;
  icon: LucideIcon;
  recordCount?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onLog?: () => void;
  menuItems?: PanelMenuItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function isRealItem(item: PanelMenuItem) {
  return !item.separator;
}

/* ─── Menu Dropdown (portal) ────────────────────────────────────────────── */

function MenuDropdown({
  items,
  onClose,
  triggerRef,
}: {
  items: PanelMenuItem[];
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, triggerRef]);

  const colorMap: Record<string, string> = {
    gray: "text-gray-600",
    green: "text-[#009B4D]",
    orange: "text-[#FB7506]",
    blue: "text-blue-600",
    red: "text-red-500",
  };

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white border border-gray-200 shadow-xl py-1 rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100 divide-y divide-black/5"
      style={(() => {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        return {
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
          minWidth: 220,
          maxWidth: 320,
        };
      })()}
    >
      <div className="flex flex-col max-h-[70vh] overflow-y-auto">
        {items.map((item, i) => {
          if (item.separator) {
            return (
              <div key={`sep-${i}`} className="border-t border-gray-100" />
            );
          }
          const Icon = item.icon;
          const colorClass = colorMap[item.color || "gray"];
          return (
            <button
              key={`${item.label}-${i}`}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold transition-colors text-left",
                item.disabled
                  ? "opacity-40 cursor-not-allowed text-gray-400"
                  : "hover:bg-[#FB7506]/10 text-gray-700"
              )}
            >
              {Icon && (
                <Icon
                  size={16}
                  className={cn(
                    "shrink-0",
                    item.disabled ? "text-gray-300" : colorClass
                  )}
                />
              )}
              <span className={cn(item.disabled ? "text-gray-400" : colorClass)}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

/* ─── PanelGrid ─────────────────────────────────────────────────────────── */

export default function PanelGrid({
  title,
  icon: Icon,
  recordCount,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onRefresh,
  refreshing = false,
  onLog,
  menuItems,
  headerRight,
  children,
  className,
}: PanelGridProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Filter out real (non-separator) items
  const realItems = menuItems?.filter(isRealItem) ?? [];
  const hasMenu = realItems.length > 1;
  const singleItem = realItems.length === 1 ? realItems[0] : null;

  const btnBgMap: Record<string, string> = {
    gray: "bg-gray-500 hover:bg-gray-400",
    green: "bg-[#009B4D] hover:bg-green-600",
    orange: "bg-[#FB7506] hover:bg-orange-500",
    blue: "bg-blue-600 hover:bg-blue-500",
    red: "bg-red-500 hover:bg-red-400",
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-md bg-white border border-black overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 border-b border-black/10">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className="text-[#FB7506] shrink-0" />
          <span className="text-white text-[13px] font-bold uppercase tracking-[0.1em] truncate">
            {title}
            {recordCount !== undefined && (
              <span className="ml-1">({recordCount})</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Search */}
          {onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-black/30" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white/50 text-black placeholder:text-black/30 text-[10px] pl-7 pr-2 py-1 rounded-md border border-black/20 outline-none w-32 focus:w-40 focus:bg-white transition-all font-bold"
              />
            </div>
          )}

          {/* Log icon */}
          {onLog && (
            <button
              onClick={onLog}
              className="text-white hover:text-[#FB7506] transition-all p-1"
              title="Transaction Log"
            >
              <History size={16} />
            </button>
          )}

          {/* Refresh icon */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-white hover:text-[#FB7506] transition-all hover:rotate-180 duration-500 p-1"
              title="Refresh"
            >
              <RefreshCcw size={16} className={cn(refreshing && "animate-spin")} />
            </button>
          )}

          {/* Single action button (no menu) */}
          {singleItem && !hasMenu && (
            <button
              onClick={singleItem.onClick}
              disabled={singleItem.disabled}
              className={cn(
                "px-3 h-7 rounded-md font-black text-[10px] flex items-center gap-1.5 text-white transition-all shrink-0 uppercase",
                btnBgMap[singleItem.color || "orange"],
                singleItem.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {singleItem.icon && <singleItem.icon size={14} />}
              <span>{singleItem.label}</span>
            </button>
          )}

          {/* Custom extra node (e.g. AuditLogModal) */}
          {headerRight}

          {/* Menu hamburger — orange lines only */}
          {hasMenu && (
            <div className="relative">
              <button
                ref={menuBtnRef}
                onClick={() => setMenuOpen((v) => !v)}
                className="h-10 w-10 flex flex-col items-center justify-center gap-[5px] hover:bg-white/10 transition-colors"
                title="Menu"
              >
                {menuOpen ? (
                  <>
                    <span className="block h-5 w-[2px] bg-[#FB7506] rounded-full -ml-[5px]" />
                    <span className="block h-5 w-[2px] bg-[#FB7506] rounded-full" />
                    <span className="block h-5 w-[2px] bg-[#FB7506] rounded-full ml-[5px]" />
                  </>
                ) : (
                  <>
                    <span className="block w-5 h-[2px] bg-[#FB7506] rounded-full" />
                    <span className="block w-5 h-[2px] bg-[#FB7506] rounded-full" />
                    <span className="block w-5 h-[2px] bg-[#FB7506] rounded-full" />
                  </>
                )}
              </button>
              {menuOpen && (
                <MenuDropdown
                  items={menuItems!}
                  onClose={() => setMenuOpen(false)}
                  triggerRef={menuBtnRef}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record count bar */}
      {recordCount !== undefined && (
        <div className="bg-white border-b p-1 text-right text-[10px] text-gray-400 font-bold italic pr-4">
          {recordCount} Records
        </div>
      )}

      {/* Content (table) */}
      <div className="flex-1 overflow-auto min-h-0">{children}</div>
    </div>
  );
}
