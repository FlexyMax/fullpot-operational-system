"use client";

import { X, Save, RefreshCcw, Pencil, Plus, Trash2, Check, AlertCircle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  k: string;
  l: string;
  type?: string;
  disabled?: boolean;
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
  success?: string | null;
  readOnly?: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  position?: string;
  extraContent?: React.ReactNode;
  className?: string;
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
  success,
  readOnly = false,
  onEdit,
  onAdd,
  onDelete,
  onFirst,
  onPrev,
  onNext,
  onLast,
  canPrev = false,
  canNext = false,
  position,
  extraContent,
  className,
}: EntityFormModalProps) {
  if (!open) return null;

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="h-10 bg-[#374151] flex items-center px-3 gap-2 shrink-0">
        {Icon && <Icon size={14} className="text-[#FB7506] shrink-0" />}
        <span className="text-white text-xs font-black uppercase tracking-wider truncate">
          {title}
        </span>

        <div className="flex-1" />

        {error && <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-1 truncate"><AlertCircle size={12} />{error}</span>}
        {success && <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold ml-1"><Check size={12} />{success}</span>}

        {/* Nav buttons (view mode) */}
        {readOnly && (onFirst || onPrev || onNext || onLast) && (
          <div className="flex items-center border-r border-white/20">
            {[
              { icon: ChevronsLeft,  fn: onFirst, disabled: !canPrev },
              { icon: ChevronLeft,   fn: onPrev,  disabled: !canPrev },
              { icon: ChevronRight,  fn: onNext,  disabled: !canNext },
              { icon: ChevronsRight, fn: onLast,  disabled: !canNext },
            ].map(({ icon: NavIcon, fn, disabled }, idx) => (
              fn && (
                <button key={idx} onClick={fn} disabled={disabled}
                  className="w-8 h-10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <NavIcon size={13} />
                </button>
              )
            ))}
            {position && <span className="text-[9px] text-gray-400 font-bold px-2">{position}</span>}
          </div>
        )}

        {/* Save/Cancel (edit mode) */}
        {!readOnly && (
          <div className="flex items-center gap-1.5 px-2 border-r border-white/20">
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
              {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={onClose}
              className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
              <X size={14} />Cancel
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center">
          {readOnly && onEdit && (
            <button onClick={onEdit} className="w-8 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors" title="Edit">
              <Pencil size={14} />
            </button>
          )}
          {readOnly && onAdd && (
            <button onClick={onAdd} className="w-8 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors" title="Add">
              <Plus size={14} />
            </button>
          )}
          {readOnly && onDelete && (
            <button onClick={onDelete} className="w-8 h-10 flex items-center justify-center text-white hover:bg-red-500/30 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
          {extraContent}
        </div>
      </div>

      {/* Form fields */}
      <div className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {fields.map((f) => (
            <div key={f.k} className="flex flex-col gap-0.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.l}</label>
              <input
                value={form[f.k] ?? ""}
                disabled={readOnly || f.disabled}
                onChange={(e) => onChange(f.k, e.target.value)}
                className={cn(
                  "h-10 bg-white border border-gray-300 rounded px-2 text-sm text-gray-700 outline-none focus:border-[#FB7506] focus:ring-1 focus:ring-[#FB7506] transition-all",
                  (readOnly || f.disabled) && "bg-gray-50 text-gray-600"
                )}
              />
            </div>
          ))}
        </div>

        {checkFields.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-2 mt-2 border-t border-gray-100">
            {checkFields.map((c) => (
              <label key={c.k} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[c.k])}
                  disabled={readOnly}
                  onChange={(e) => onChange(c.k, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#FB7506] focus:ring-[#FB7506]"
                />
                <span className="text-[10px] font-bold text-gray-600">{c.l}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
