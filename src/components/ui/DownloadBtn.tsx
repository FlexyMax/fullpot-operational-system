"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { downloadCSV, downloadXLS } from "@/lib/csv";

interface DownloadBtnProps {
    data: any[];
    filename: string;
}

export function DownloadBtn({ data, filename }: DownloadBtnProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-0.5 text-gray-400 hover:text-[#FB7506] transition-colors p-1"
                title="Download"
            >
                <Download size={15} />
                <ChevronDown size={9} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50 text-[11px]">
                    <button
                        onClick={() => { downloadCSV(data, `${filename}.csv`); setOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-medium text-gray-700"
                    >
                        Download as CSV
                    </button>
                    <button
                        onClick={() => { downloadXLS(data, filename); setOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-medium text-gray-700"
                    >
                        Download as Excel
                    </button>
                </div>
            )}
        </div>
    );
}
