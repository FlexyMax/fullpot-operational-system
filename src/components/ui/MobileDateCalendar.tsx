"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeToISODate } from "@/lib/dates";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface MobileDateCalendarProps {
    dates: any[];
    dateGetter: (row: any) => string | null;
    countGetter: (row: any) => number;
    selectedDate: string | null;
    onSelect: (date: string) => void;
    selectedYear?: number;
    yearOptions?: { v: string }[];
    onYearChange?: (year: number) => void;
    loading?: boolean;
    className?: string;
}

export function MobileDateCalendar({
    dates,
    dateGetter,
    countGetter,
    selectedDate,
    onSelect,
    selectedYear,
    yearOptions,
    onYearChange,
    loading,
    className,
}: MobileDateCalendarProps) {
    const todayISO = new Date().toISOString().split("T")[0];
    const now = new Date();

    const [viewYear, setViewYear] = useState(selectedYear ?? now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    // When the year changes externally or dates load, jump to the month of the most recent date
    useEffect(() => {
        if (selectedYear !== undefined) setViewYear(selectedYear);
        if (dates.length > 0) {
            const ds = dateGetter(dates[0]);
            if (ds) {
                const norm = normalizeToISODate(ds) || ds.substring(0, 10);
                const d = new Date(norm + "T00:00:00");
                if (!isNaN(d.getTime())) {
                    setViewMonth(d.getMonth());
                    setViewYear(d.getFullYear());
                }
            }
        }
    }, [selectedYear, dates]);

    // Build lookup: YYYY-MM-DD → count
    const countMap = useMemo(() => {
        const m: Record<string, number> = {};
        for (const row of dates) {
            const ds = dateGetter(row);
            if (!ds) continue;
            const norm = normalizeToISODate(ds) || ds.substring(0, 10);
            if (norm) m[norm] = countGetter(row);
        }
        return m;
    }, [dates]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build the calendar grid cells
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className={cn("bg-white border border-[#DBD9D9] rounded-md p-2.5 shrink-0", className)}>
            {/* Month navigation + year selector */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={prevMonth}
                    className="p-1 text-gray-400 hover:text-[#FB7506] transition-colors rounded"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-gray-700">
                        {MONTH_NAMES[viewMonth]}
                    </span>
                    {yearOptions && onYearChange ? (
                        <select
                            value={selectedYear}
                            onChange={e => onYearChange(Number(e.target.value))}
                            className="bg-white text-gray-700 border border-gray-300 text-[10px] font-black rounded px-1.5 py-0.5 outline-none"
                        >
                            {yearOptions.map(y => (
                                <option key={y.v} value={y.v}>{y.v}</option>
                            ))}
                        </select>
                    ) : (
                        <span className="text-[10px] font-black text-gray-500">{viewYear}</span>
                    )}
                </div>

                <button
                    onClick={nextMonth}
                    className="p-1 text-gray-400 hover:text-[#FB7506] transition-colors rounded"
                    aria-label="Next month"
                >
                    <ChevronRight size={15} />
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(l => (
                    <div key={l} className="text-center text-[9px] font-black text-gray-400 py-0.5">
                        {l}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                    if (day === null) return <div key={i} />;

                    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const count = countMap[iso];
                    const isSelected = selectedDate === iso;
                    const isToday = iso === todayISO;
                    const hasData = count !== undefined && count > 0;

                    return (
                        <button
                            key={i}
                            onClick={() => hasData ? onSelect(iso) : undefined}
                            disabled={!hasData}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-md py-1 min-h-[36px] transition-colors",
                                isSelected
                                    ? "bg-[#FB7506]"
                                    : hasData
                                        ? "hover:bg-orange-50 active:bg-orange-100 cursor-pointer"
                                        : "cursor-default",
                                isToday && !isSelected ? "ring-1 ring-[#FB7506]" : "",
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-semibold leading-none",
                                isSelected ? "text-white" : hasData ? "text-gray-800" : "text-gray-300",
                            )}>
                                {day}
                            </span>
                            {hasData && (
                                <span className={cn(
                                    "text-[8px] font-black mt-0.5 leading-none",
                                    isSelected ? "text-white/80" : "text-[#FB7506]",
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading && (
                <div className="text-center text-[9px] text-gray-400 mt-1.5">Loading…</div>
            )}
        </div>
    );
}
