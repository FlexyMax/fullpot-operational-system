"use client";

import { useState } from "react";
import { XCircle, RefreshCcw, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  customer: string;
  disabled?: boolean;
}

export function ViewBalanceModal({ customer, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (!customer || disabled) return;
    setOpen(true);
    setLoading(true);
  };

  const url = `/api/reports/balance?customer=${encodeURIComponent(customer)}`;

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={!!disabled}
        title="View Balance"
        className={cn(
          "flex items-center justify-center rounded transition-all p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <Landmark size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <Landmark size={14} className="text-[#FB7506]" />
                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                  Balance - {customer}
                </span>
                {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-2" />}
              </div>
              <button onClick={() => setOpen(false)}>
                <XCircle size={16} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>

            <div className="flex-1 w-full bg-gray-100 overflow-hidden min-h-[500px]">
              <iframe
                src={url}
                className="w-full h-full border-none"
                onLoad={() => setLoading(false)}
                title={`Balance for ${customer}`}
              />
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t rounded-b-xl flex items-center justify-end shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
