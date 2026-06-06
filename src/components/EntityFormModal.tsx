"use client";

import { X, Save, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  k: string;
  l: string;
  type?: string;
}

interface CheckField {
  k: string;
  l: string;
}

interface EntityFormModalProps {
  open: boolean;
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  recordId?: string | null;
  subtitle?: string;
  form: Record<string, any>;
  fields: FormField[];
  checkFields?: CheckField[];
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
  error?: string | null;
}

export function EntityFormModal({
  open,
  title,
  icon: Icon,
  recordId,
  subtitle,
  form,
  fields,
  checkFields = [],
  onChange,
  onSave,
  onClose,
  saving,
  error,
}: EntityFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 border-b border-black/10">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={16} className="text-[#FB7506] shrink-0" />}
          <div className="min-w-0">
            <span className="fos-grid-header-text truncate block">{title}</span>
            {subtitle && <span className="text-[10px] text-gray-400 font-bold truncate block">{subtitle}</span>}
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-red-600 font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.k} className="flex flex-col gap-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.l}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={form[f.k] || ""}
                  onChange={(e) => onChange(f.k, e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#FB7506] focus:ring-1 focus:ring-[#FB7506] transition-all resize-none"
                />
              ) : (
                <input
                  type={f.type || "text"}
                  value={form[f.k] || ""}
                  onChange={(e) => onChange(f.k, e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#FB7506] focus:ring-1 focus:ring-[#FB7506] transition-all h-10"
                />
              )}
            </div>
          ))}
        </div>

        {checkFields.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-100">
            {checkFields.map((c) => (
              <label key={c.k} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[c.k]}
                  onChange={(e) => onChange(c.k, e.target.checked)}
                  className="w-5 h-5 accent-[#FB7506]"
                />
                <span className="text-sm font-semibold text-gray-600">{c.l}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="shrink-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full h-12 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
    </div>
  );
}
