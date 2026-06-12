import { cn } from "@/lib/utils";
import { X, FileText, ClipboardList, CreditCard, type LucideIcon } from "lucide-react";

const GRID_LABELS: Record<string, string> = {
    customer: "Customer",
    invoices: "Invoices",
    payments: "Payments",
    crdb: "Cr / Db",
    corporate: "Corp. Payments",
    "corp-invoice": "Corp. Invoices",
    "not-ready": "Not Ready",
    "ready": "Ready to QB",
    "sent": "Sent to QB",
    terms: "Terms",
    po: "PO",
    prebooks: "Prebooks",
    credits: "Credits & Debits",
};

const GRID_ICONS: Record<string, LucideIcon> = {
    invoices: FileText,
    po: ClipboardList,
    credits: CreditCard,
};

export function MobileActionBar({ activeGrid, items, onClearSelection }: any) {
    const isVisible = !!activeGrid;
    const GridIcon = activeGrid ? GRID_ICONS[activeGrid] : null;
    return (
        <div className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-1.5 px-2",
            isVisible ? "translate-y-0" : "translate-y-full"
        )}>
            {activeGrid && GRID_LABELS[activeGrid] && (
                <div className="flex items-center justify-center gap-1 mb-1">
                    {GridIcon && <GridIcon size={9} className="text-gray-400" />}
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-gray-400">{GRID_LABELS[activeGrid]}</span>
                </div>
            )}
            <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none justify-center">
                {items.filter((i:any)=>i.grid===activeGrid).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                        {idx > 0 && <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />}
                        <button onClick={item.onClick} disabled={item.disabled}
                            className={cn("flex flex-col items-center gap-1 disabled:opacity-50 transition-colors min-w-[56px] shrink-0",
                                item.color === "red" ? "hover:text-red-600 text-gray-600" :
                                item.color === "green" ? "hover:text-green-600 text-gray-600" :
                                item.color === "blue" ? "hover:text-blue-600 text-gray-600" :
                                "hover:text-[#FB7506] text-gray-600"
                            )}>
                            {item.icon && <item.icon size={20} className={cn(!item.disabled && (
                                item.color === "red" ? "text-red-500" :
                                item.color === "green" ? "text-green-500" :
                                item.color === "blue" ? "text-blue-500" :
                                item.color === "orange" ? "text-[#FB7506]" : "text-gray-600"
                            ))} />}
                            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                        </button>
                    </div>
                ))}
                
                {onClearSelection && (
                    <>
                        <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />
                        <button onClick={onClearSelection}
                            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors min-w-[56px] shrink-0">
                            <X size={20} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Close</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
