import { AlertCircle, Trash2, RefreshCcw } from "lucide-react";

export function ConfirmDelete({ title, msg, onConfirm, onCancel, saving }: any) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="h-10 bg-red-50 flex items-center pl-3 pr-2 border-b border-red-100 shrink-0">
                    <span className="text-red-600 font-bold tracking-wide text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {title}
                    </span>
                </div>
                <div className="p-5 text-sm text-gray-700 font-medium">
                    {msg}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={saving} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50 uppercase tracking-wider">
                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
