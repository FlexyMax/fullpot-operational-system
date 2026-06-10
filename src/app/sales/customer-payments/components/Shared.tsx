import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";

export const EMPTY_ARR: any[] = [];
export const t   = (v: any) => String(v ?? "").trim();
export const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
export const today = () => new Date().toISOString().split("T")[0];

export const toastConfirm = (message: string, onConfirm: () => void, confirmLabel = "Confirm") => {
    toast(message, {
        duration: 10000,
        action:  { label: confirmLabel, onClick: onConfirm },
        cancel:  { label: "Cancel",  onClick: () => {} },
    });
};

export const cpFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

export function Modal({ title, icon: Icon, onClose, children, footer, size = "md", error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={cn("bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90dvh]",
                size === "lg" ? "max-w-3xl" : size === "xl" ? "max-w-4xl" : "max-w-lg")}>
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-[#FB7506]"/>}
                        <span className="fos-grid-header-text truncate">{title}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">{footer}</div>}
            </div>
        </div>
    );
}

export function Btn({ icon: Icon, label, color = "gray", onClick, disabled = false }: any) {
    const cls: Record<string, string> = { green: "bg-green-600 hover:bg-green-700", blue: "bg-blue-600 hover:bg-blue-700", red: "bg-red-600 hover:bg-red-700", gray: "bg-gray-600 hover:bg-gray-700", amber: "bg-amber-500 hover:bg-amber-600", orange: "bg-[#FB7506] hover:bg-orange-600" };
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs text-white font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0", cls[color] || cls.gray)}>
            {Icon && <Icon size={13}/>}{label}
        </button>
    );
}
