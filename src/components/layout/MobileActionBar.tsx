import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function MobileActionBar({ activeGrid, items, onClearSelection }: any) {
    const isVisible = !!activeGrid;
    return (
        <div className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
            isVisible ? "translate-y-0" : "translate-y-full"
        )}>
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
