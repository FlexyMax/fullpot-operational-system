import React, { useState, useRef, useEffect } from "react";
import { X, Save, Camera, UserCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/system/useUserStore";

const LEVELS = ["ADMINISTRADOR", "DIGITADOR 1", "DIGITADOR 2", "VISITANTE"];

const EMPTY_FORM = {
    unico: "", cedula: "", nombres: "", apellidos: "", username: "",
    clave: "", nivel: "", cargo: "", correo: "", image: "",
    activo: true, windows_usuario: "", windows_password: "",
};

const generateUsername = (nombres: string, apellidos: string) => {
    const first = nombres.trim().charAt(0).toLowerCase();
    const last  = apellidos.trim().replace(/\s/g, "").substring(0, 9).toLowerCase();
    return first + last;
};

export function UserUpsertModal({ onSaved }: { onSaved: () => void }) {
    const { isUpsertModalOpen, setUpsertModalOpen, mode, selectedRow } = useUserStore();
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isUpsertModalOpen) {
            if (mode === "add") {
                setForm(EMPTY_FORM);
            } else if (selectedRow) {
                setForm({
                    unico:            selectedRow.unico            ?? "",
                    cedula:           String(selectedRow.cedula    || "").trim(),
                    nombres:          String(selectedRow.nombres   || "").trim(),
                    apellidos:        String(selectedRow.apellidos || "").trim(),
                    username:         String(selectedRow.username  || "").trim(),
                    clave:            String(selectedRow.clave     || "").trim(),
                    nivel:            String(selectedRow.nivel     || "").trim(),
                    cargo:            String(selectedRow.cargo     || "").trim(),
                    correo:           String(selectedRow.correo    || "").trim(),
                    image:            String(selectedRow.image     || "").trim(),
                    activo:           Boolean(selectedRow.activo),
                    windows_usuario:  String(selectedRow.windows_usuario  || "").trim(),
                    windows_password: String(selectedRow.windows_password || "").trim(),
                });
            }
            setPhotoFile(null);
            setPhotoPreview(null);
            setError(null);
        }
    }, [isUpsertModalOpen, mode, selectedRow]);

    if (!isUpsertModalOpen) return null;

    const validate = (): string | null => {
        if (!form.nombres.trim())   return "First name is required.";
        if (!form.apellidos.trim()) return "Last name is required.";
        if (!form.username.trim())  return "Username for the system is required.";
        if (!form.clave.trim())     return "Password is required.";
        if (!form.nivel.trim())     return "Level is required.";
        return null;
    };

    const handleSave = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        setSaving(true); setError(null);
        try {
            let targetUnico = form.unico;
            let res;
            if (mode === "add") {
                res = await fetch("/api/system/users", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            } else {
                res = await fetch(`/api/system/users/${form.unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Operation failed");
            
            if (mode === "add") targetUnico = data.unico;

            if (photoFile && targetUnico) {
                const fd = new FormData();
                fd.append("photo", photoFile);
                await fetch(`/api/system/users/${targetUnico}/photo`, { method: "POST", body: fd });
            }

            onSaved();
            setUpsertModalOpen(false);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const photoSrc = photoPreview
        ? photoPreview
        : form.unico
            ? `/api/system/users/${form.unico}/photo`
            : null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <span className="fos-grid-header-text">{mode === "add" ? "New User" : "Edit User"}</span>
                    <button onClick={() => setUpsertModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="p-4 flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-2 shrink-0 w-24">
                        <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {photoSrc ? (
                                <img src={photoSrc} alt="User" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                                <UserCircle2 size={40} className="text-gray-300" />
                            )}
                        </div>
                        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wide w-full justify-center transition-all">
                            <Camera size={14} /> Photo
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                        {[
                            { label: "Code",       key: "unico",    readonly: true },
                            { label: "ID / Cédula",key: "cedula",   readonly: false },
                            { label: "First Name", key: "nombres",  readonly: false },
                            { label: "Last Name",  key: "apellidos",readonly: false },
                            { label: "Username",   key: "username", readonly: false },
                            { label: "Password",   key: "clave",    readonly: false, type: "password" },
                            { label: "Position",   key: "cargo",    readonly: false },
                            { label: "E-mail",     key: "correo",   readonly: false },
                            { label: "W. User",    key: "windows_usuario",  readonly: false },
                            { label: "W. Password",key: "windows_password", readonly: false },
                        ].map(f => (
                            <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.label}</label>
                                <input
                                    type={f.type || "text"}
                                    value={(form as any)[f.key] || ""}
                                    readOnly={f.readonly}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setForm(prev => {
                                            const next = { ...prev, [f.key]: val };
                                            if (f.key === "apellidos" && mode === "add") next.username = generateUsername(prev.nombres, val);
                                            if (f.key === "nombres" && mode === "add") next.username = generateUsername(val, prev.apellidos);
                                            return next;
                                        });
                                    }}
                                    className={cn("fos-input h-8 text-sm", f.readonly && "bg-gray-50 text-gray-500 cursor-default")}
                                />
                            </div>
                        ))}

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Level</label>
                            <select value={form.nivel} onChange={e => setForm(prev => ({ ...prev, nivel: e.target.value }))} className="fos-input h-8 text-sm">
                                <option value="">— Select —</option>
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 justify-center">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Active</label>
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input type="checkbox" checked={Boolean(form.activo)} disabled={mode === "add"} onChange={e => setForm(prev => ({ ...prev, activo: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]" />
                                <span className={cn("text-xs font-semibold", form.activo ? "text-green-600" : "text-gray-400")}>
                                    {form.activo ? "Yes" : "No"}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t bg-gray-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {error && <span className="flex items-center gap-1 text-red-500 text-[10px] font-bold"><AlertCircle size={12}/>{error}</span>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setUpsertModalOpen(false)} className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors uppercase">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 text-white px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50">
                            <Save size={14} /> {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
