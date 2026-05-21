"use client";

import { useState, useRef, useEffect } from "react";
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
}

export function TopActionBar({ title, actions }: TopActionBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-8 flex items-stretch overflow-visible z-10 shrink-0">
      {/* Title section - dark gray */}
      <div className="bg-[#4b5563] text-white text-[11px] font-bold px-3 flex items-center shrink-0 w-1/2">
        {title}
      </div>
      
      {/* Action section - orange */}
      <div className="bg-[#fb923c] flex-1 flex justify-center items-center relative">
        <button 
          onClick={() => setOpen(!open)}
          className="p-1 hover:bg-black/10 rounded transition-colors"
        >
          <Menu size={16} className="text-black" />
        </button>

        {open && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50 text-[11px] font-medium"
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2",
                  action.colorClass || "text-green-600"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
