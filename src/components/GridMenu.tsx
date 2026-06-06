"use client";

import { useState } from "react";
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

const ITEM_COLORS: Record<string, { icon: string; text: string }> = {
  green:  { icon: "text-green-600",  text: "text-green-700" },
  orange: { icon: "text-[#FB7506]", text: "text-gray-800" },
  red:    { icon: "text-red-500",    text: "text-gray-800" },
  blue:   { icon: "text-blue-600",   text: "text-gray-800" },
  gray:   { icon: "text-gray-500",   text: "text-gray-700" },
  amber:  { icon: "text-amber-500",  text: "text-gray-800" },
  purple: { icon: "text-purple-500", text: "text-gray-800" },
};

export function GridMenu({
  items,
  disabled: globalDisabled,
}: {
  items: GridMenuItem[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-10 bg-[#FB7506] hover:bg-orange-600 text-white w-24 flex items-center justify-center transition-colors border-none cursor-pointer shadow-inner rounded-tr-lg"
        title="Menu"
      >
        <Menu size={20} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
          onMouseLeave={() => setOpen(false)}
        >
          {items.map((item, i) => {
            if (item.separator) {
              return <div key={i} className="border-t border-gray-200 my-0.5" />;
            }
            const c = ITEM_COLORS[item.color] || ITEM_COLORS.gray;
            return (
              <button
                key={i}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                disabled={!!item.disabled || !!globalDisabled}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                  i < items.length - 1 && "border-b border-gray-100"
                )}
              >
                <item.icon size={18} className={c.icon} />
                <span className={cn("text-sm font-bold", c.text)}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
