const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/masters/freights/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newSetupModal = `function SetupModal({ title, icon: Icon, onClose, listUrl, detailUrl, emptyForm, cols, formFields, checkFields, growers = [] }: any) {
    const t2 = (v: any) => String(v ?? "").trim();
    const [rows,     setRows]     = useState<any[]>([]);
    const [selRow,   setSelRow]   = useState<any>(null);
    const [mode,     setMode]     = useState<"view"|"add"|"edit"|"delete">("view");
    const [form,     setForm]     = useState<any>(emptyForm);
    const [search,   setSearch]   = useState("");
    const [loading,  setLoading]  = useState(false);
    const [saving,   setSaving]   = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await ff(\`\${listUrl}?search=\${encodeURIComponent(search||"%")}\`);
            setRows(d);
            if (d.length > 0 && !selRow) setSelRow(d[0]);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [listUrl, search]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (selRow && mode === "view") {
            const f: any = {};
            formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]||""); });
            checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];   });
            if (title === "Warehouses") {
                f.handling_kg = selRow.handling_kg || 0;
                f.grower_uq = selRow.grower_uq || "";
            }
            setForm(f);
        }
    }, [selRow, mode]);

    const openAdd = () => {
        setForm({...emptyForm}); setMode("add");
    };
    const openEdit = () => {
        if (!selRow) return;
        const f: any = {};
        formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]||""); });
        checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];    });
        if (title === "Warehouses") {
            f.handling_kg = selRow.handling_kg || 0;
            f.grower_uq = selRow.grower_uq || "";
        }
        setForm(f); setMode("edit");
    };

    const save = async () => {
        setSaving(true);
        try {
            if (mode === "add") {
                await fetch(detailUrl, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            } else if (mode === "edit" && selRow) {
                await fetch(\`\${detailUrl}/\${selRow.unico}\`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            }
            await load(); setMode("view");
            toast.success("Saved successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const del = async () => {
        if (!selRow) return;
        setSaving(true);
        try { 
            await fetch(\`\${detailUrl}/\${selRow.unico}\`, { method:"DELETE" }); 
            setSelRow(null); 
            await load(); 
            setMode("view");
            toast.success("Deleted successfully");
        }
        catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    if (mode === "delete") {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                    <div className="p-6 flex flex-col items-center gap-4 text-center">
                        <Trash2 size={48} className="text-red-500" />
                        <h3 className="text-lg font-bold text-gray-800">Delete Record?</h3>
                        <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{t2(selRow?.[cols[0]?.key])}</strong>? This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                        <button onClick={() => setMode("view")} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={del} disabled={saving} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2">
                            {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {mode === "view" ? (
                    <div className="flex flex-col h-full overflow-hidden relative">
                        <button onClick={onClose} className="absolute top-2 right-24 z-[100] text-gray-400 hover:text-white p-1 rounded-full"><X size={18}/></button>
                        
                        <PanelGrid
                            title={title}
                            icon={Icon || Building2}
                            recordCount={rows.length}
                            onRefresh={() => load()}
                            refreshing={loading}
                            menuItems={[
                                { label:"Add Record", icon:Plus, color:"green", onClick:openAdd },
                                { label:"Edit Selected", icon:Pencil, color:"blue", onClick:openEdit, disabled:!selRow },
                                { label:"Delete Selected", icon:Trash2, color:"red", onClick:() => setMode("delete"), disabled:!selRow }
                            ]}
                            className="flex flex-col h-full border-0 rounded-none shadow-none"
                        >
                            {/* Toolbar under header */}
                            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex shrink-0">
                                <div className="relative flex-1 max-w-xs">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); }} placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                                </div>
                            </div>
                            <div className="h-full overflow-auto">
                                <PanelGridTable>
                                    <PanelGridThead>
                                        {cols.map((c: any) => <PanelGridTh key={c.key}>{c.label}</PanelGridTh>)}
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {rows.length === 0 ? (
                                            <PanelGridTr><PanelGridTd colSpan={cols.length} className="p-4 text-center text-gray-300 italic text-xs">No records found.</PanelGridTd></PanelGridTr>
                                        ) : rows.map((r: any, i: number) => (
                                            <PanelGridTr key={r.unico||i} selected={selRow?.unico === r.unico} onClick={() => { if(selRow?.unico === r.unico) setSelRow(null); else setSelRow(r); }}>
                                                {cols.map((c: any) => (
                                                    <PanelGridTd key={c.key}>{c.render ? c.render(r[c.key], r) : t2(r[c.key])}</PanelGridTd>
                                                ))}
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </div>
                        </PanelGrid>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="h-12 bg-[#374151] flex items-center justify-between px-5 shrink-0 border-b border-black/10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setMode("view")} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-black text-[13px] uppercase tracking-widest text-white">
                                    {mode === "add" ? \`New \${title}\` : \`Edit \${title}: \${t2(selRow?.[cols[0]?.key])}\`}
                                </span>
                            </div>
                            <button onClick={() => setMode("view")}><X size={18} className="text-gray-400 hover:text-white" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    {formFields.map((f: any) => (
                                        <div key={f.k} className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{f.l}</label>
                                            <input type={f.type||"text"} value={form[f.k]||""}
                                                onChange={e => setForm((p: any) => ({...p, [f.k]: e.target.value}))}
                                                className="fos-input h-10 text-sm" />
                                        </div>
                                    ))}
                                    {title === "Warehouses" && (
                                        <>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Handling KG</label>
                                                <input type="number" value={form.handling_kg||0} onChange={e=>setForm((p:any)=>({...p,handling_kg:parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grower</label>
                                                <select value={form.grower_uq||""} onChange={e=>setForm((p:any)=>({...p,grower_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                                    <option value="">— None —</option>
                                                    {growers.map((g:any) => <option key={g.unico} value={g.unico}>{t2(g.grower)}</option>)}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {checkFields.length > 0 && (
                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                                        {checkFields.map((c: any) => (
                                            <label key={c.k} className="flex items-center gap-2.5 cursor-pointer">
                                                <input type="checkbox" checked={!!form[c.k]}
                                                    onChange={e => setForm((p: any) => ({...p, [c.k]: e.target.checked}))}
                                                    className="w-4 h-4 accent-[#FB7506] rounded border-gray-300" />
                                                <span className="text-xs font-bold text-gray-700">{c.l}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 shrink-0">
                            <button onClick={() => setMode("view")} className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-white text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 bg-[#FB7506] hover:bg-orange-600 shadow-sm">
                                {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? "Saving..." : mode === "add" ? "Create" : "Save"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}`;

content = content.replace(/function SetupModal[\s\S]+?(?=\/\/\s*─── Main Page)/, newSetupModal + "\n\n");

// Add more fields to Warehouses Modal
content = content.replace(
    /cols=\{\[\{ key:"wp_name", label:"Warehouse" \}\]\}/,
    \`cols={[{ key:"wp_name", label:"Warehouse" }, { key:"city", label:"City" }, { key:"state", label:"State" }, { key:"country", label:"Country" }, { key:"phone", label:"Phone" }]}\`
);

// Add more fields to Cities Modal
content = content.replace(
    /cols=\{\[\{ key:"city", label:"City" \}\]\}/,
    \`cols={[{ key:"city", label:"City" }, { key:"country_iso", label:"Country ISO" }, { key:"buyer_email", label:"Buyer Email" }]}\`
);

// Add more fields to Airlines Modal
content = content.replace(
    /cols=\{\[\{ key:"airline", label:"Airline" \}\]\}/,
    \`cols={[{ key:"airline", label:"Airline" }, { key:"cod_linea", label:"Code" }, { key:"city", label:"City" }, { key:"phone", label:"Phone" }, { key:"email", label:"Email" }]}\`
);

// Add more fields to Seasons Modal
content = content.replace(
    /cols=\{\[\{ key:"season", label:"Season" \}\]\}/,
    \`cols={[{ key:"season", label:"Season" }, { key:"sh_season", label:"Short Name" }, { key:"startdate", label:"Start Date", render: (v:any)=>v?.split('T')[0]||'' }, { key:"enddate", label:"End Date", render: (v:any)=>v?.split('T')[0]||'' }]}\`
);


// Delete MenuDropdown since it's no longer used
content = content.replace(/function MenuDropdown[\s\S]+?\}\n\n/, "");

fs.writeFileSync(filePath, content, 'utf8');
