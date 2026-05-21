"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  colorClass?: string;
}

interface TopActionBarProps {
  title: string;
  actions: ActionItem[];
  disabled?: boolean;
}

export function TopActionBar({ title, actions, disabled = false }: TopActionBarProps) {
  const [open, setOpen]     = useState(false);
  const [pos,  setPos]      = useState({ top: 0, right: 0 });
  const buttonRef           = useRef<HTMLButtonElement>(null);
  const dropdownRef         = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current  && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  };

  const dropdown = open && mounted ? createPortal(
    <div
      ref={dropdownRef}
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-56 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-[11px] font-medium"
    >
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => { action.onClick(); setOpen(false); }}
          className={cn(
            "w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 transition-colors",
            action.colorClass || "text-green-600"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Full-width dark header — matches project standard */}
      <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
        <span className="text-white text-[11px] font-bold truncate">{title}</span>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          disabled={disabled}
          title={disabled ? "You do not have permission to perform actions." : undefined}
          className={cn(
            "ml-3 px-2.5 py-1 rounded text-white flex items-center gap-1 shrink-0 transition-colors",
            disabled
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-[#FB7506] hover:bg-orange-500"
          )}
        >
          <Menu size={14} />
        </button>
      </div>
      {dropdown}
    </>
  );
}
