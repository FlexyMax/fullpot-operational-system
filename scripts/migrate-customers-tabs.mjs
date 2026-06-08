import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:\\EIS-Data\\AppSmith\\Antigravity\\fullpot-operational-system\\src\\app\\masters\\customers\\page.tsx';
let lines = readFileSync(filePath, 'utf8').split('\n');

function findLine(str, from = 0) {
    for (let i = from; i < lines.length; i++) {
        if (lines[i].includes(str)) return i;
    }
    return -1;
}

// 1. activeTab state → activeExpTab
const l1 = findLine('useState<"statement"|"webusers"|"messages">');
if (l1 !== -1) lines[l1] = '    const [activeExpTab,   setActiveExpTab]   = useState<"shipto"|"statement"|"webusers"|"messages">("shipto");';
else { console.error('Could not find activeTab state'); process.exit(1); }

// 2. webusers query enabled
const l2 = findLine('activeTab === "webusers"');
if (l2 !== -1) lines[l2] = '        enabled:  !!selCust?.unico && expandedCustUnico !== null && activeExpTab === "webusers",';
else { console.error('Could not find webusers enabled'); process.exit(1); }

// 3. messages query enabled
const l3 = findLine('activeTab === "messages"');
if (l3 !== -1) lines[l3] = '        enabled:  !!selCust?.unico && expandedCustUnico !== null && activeExpTab === "messages",';
else { console.error('Could not find messages enabled'); process.exit(1); }

// 4. selectCustomer → reset activeExpTab
const l4 = findLine('const selectCustomer = (c: any)');
if (l4 !== -1) lines[l4] = '    const selectCustomer = (c: any) => { setSelCust(c); setSelShipto(null); setSelCarrier(null); setSelWebUser(null); setFormError(null); setExpandedShiptoUnico(null); setActiveExpTab("shipto"); };';
else { console.error('Could not find selectCustomer'); process.exit(1); }

// 5. Find customer isExp block: {isExp && ( followed by colSpan={17} within 3 lines
let custExpStart = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '{isExp && (') {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            if (lines[j].includes('colSpan={17}')) { custExpStart = i; break; }
        }
        if (custExpStart !== -1) break;
    }
}
if (custExpStart === -1) { console.error('Could not find custExpStart'); process.exit(1); }

// Find matching end: same indentation )} where next non-empty line is </Fragment>
const expIndent = lines[custExpStart].match(/^(\s*)/)[1];
let custExpEnd = -1;
for (let i = custExpStart + 1; i < lines.length; i++) {
    if (lines[i] === expIndent + ')}') {
        // Check next line is </Fragment>
        let next = i + 1;
        while (next < lines.length && lines[next].trim() === '') next++;
        if (lines[next] && lines[next].trim() === '</Fragment>') {
            custExpEnd = i;
            break;
        }
    }
}
if (custExpEnd === -1) { console.error('Could not find custExpEnd'); process.exit(1); }

console.log(`Customer expansion block: lines ${custExpStart + 1}–${custExpEnd + 1}`);

// 6. Find Tabs area: from {/* Tabs area */} to just before <AppFooter
const tabsAreaStart = findLine('{/* Tabs area */}');
if (tabsAreaStart === -1) { console.error('Could not find Tabs area start'); process.exit(1); }
const appFooterLine = findLine('<AppFooter areaLabel="Masters"', tabsAreaStart);
if (appFooterLine === -1) { console.error('Could not find AppFooter after Tabs area'); process.exit(1); }

// The closing </div> of tabs area is at appFooterLine - 2 (or -1 if blank line)
// Find the last </div> before AppFooter
let tabsAreaEnd = appFooterLine - 1;
while (tabsAreaEnd > tabsAreaStart && lines[tabsAreaEnd].trim() === '') tabsAreaEnd--;
// tabsAreaEnd should be the closing </div>

console.log(`Tabs area: lines ${tabsAreaStart + 1}–${tabsAreaEnd + 1}`);
console.log(`AppFooter at: ${appFooterLine + 1}`);

// Build the new expansion block lines
const I = expIndent; // 24 spaces
const newExpLines = (
`${I}{isExp && (
${I}    <tr>
${I}        <td colSpan={17} className="p-0 border-b border-gray-200">
${I}            <div className="bg-gray-50">
${I}                {/* ── Tab bar ── */}
${I}                <div className="flex items-end px-4 pt-1.5 gap-1 border-b border-gray-200">
${I}                    {([
${I}                        { id:"shipto",    label:"Ship-to",   icon:Truck },
${I}                        { id:"statement", label:"Statement", icon:FileText },
${I}                        { id:"webusers",  label:"Web Users", icon:Users },
${I}                        { id:"messages",  label:"Messages",  icon:MessageSquare },
${I}                    ] as const).map(tab => (
${I}                        <button key={tab.id} onClick={e => { e.stopPropagation(); setActiveExpTab(tab.id); }}
${I}                            className={cn("flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-wider transition-all border-b-2",
${I}                                activeExpTab === tab.id ? "border-[#FB7506] text-[#FB7506]" : "border-transparent text-gray-400 hover:text-gray-600")}>
${I}                            <tab.icon size={10} />{tab.label}
${I}                        </button>
${I}                    ))}
${I}                </div>
${I}                {/* ── Ship-to tab ── */}
${I}                {activeExpTab === "shipto" && (
${I}                    <div className="pl-4 pr-2 py-2 flex flex-col gap-2">
${I}                        <PanelGrid
${I}                            title="Ship-to Addresses"
${I}                            icon={Truck}
${I}                            recordCount={(shiptos as any[]).length}
${I}                            onRefresh={() => { if (selCust) refetchShiptos(); }}
${I}                            refreshing={loadingShiptos}
${I}                            headerRight={<AuditLogModal recordId={selShipto?.unico} disabled={!selShipto?.unico} bareButton />}
${I}                            menuItems={[
${I}                                { label: "Add Address", icon: Plus, color: "green", onClick: () => { setShiptoForm({...EMPTY_SHIPTO}); setFormError(null); setShiptoModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
${I}                                { label: "Edit Address", icon: Pencil, color: "orange", onClick: () => { if(!selShipto) return; setShiptoForm({...selShipto, dc_uq:t(selShipto.dc_uq), route_uq:t(selShipto.route_uq)}); setFormError(null); setShiptoModal({ mode:"edit" }); }, disabled: !selShipto || !perms.canEdit },
${I}                                { label: "Delete Address", icon: Trash2, color: "orange", onClick: () => { if(selShipto) { setFormError(null); setShiptoModal({ mode:"delete" }); } }, disabled: !selShipto || !perms.canDelete },
${I}                                { separator: true },
${I}                                { label: "Copy from Billing", icon: Copy, color: "gray", onClick: copyFromBilling, disabled: !selCust },
${I}                            ]}
${I}                        >
${I}                            <PanelGridTable>
${I}                                <PanelGridThead>
${I}                                    <PanelGridTh className="w-6">{""}</PanelGridTh>
${I}                                    <PanelGridTh>#</PanelGridTh>
${I}                                    <PanelGridTh>Name</PanelGridTh>
${I}                                    <PanelGridTh className="hidden sm:table-cell">Address</PanelGridTh>
${I}                                    <PanelGridTh>City</PanelGridTh>
${I}                                    <PanelGridTh className="hidden md:table-cell">State</PanelGridTh>
${I}                                    <PanelGridTh className="hidden md:table-cell">Zip</PanelGridTh>
${I}                                    <PanelGridTh className="hidden lg:table-cell">Country</PanelGridTh>
${I}                                    <PanelGridTh className="hidden lg:table-cell">Contact</PanelGridTh>
${I}                                    <PanelGridTh className="hidden xl:table-cell">Phone</PanelGridTh>
${I}                                    <PanelGridTh>Zone</PanelGridTh>
${I}                                    <PanelGridTh className="hidden sm:table-cell">Route</PanelGridTh>
${I}                                    <PanelGridTh align="center">24h</PanelGridTh>
${I}                                    <PanelGridTh align="center">Truck</PanelGridTh>
${I}                                </PanelGridThead>
${I}                                <PanelGridTbody>
${I}                                    {(shiptos as any[]).length === 0
${I}                                        ? <tr><td colSpan={14} className="p-6 text-center text-gray-300 text-xs">{loadingShiptos ? "Loading..." : "No ship-to addresses"}</td></tr>
${I}                                        : (shiptos as any[]).map((s: any) => {
${I}                                            const isShiptoSel = selShipto?.unico === s.unico;
${I}                                            const isShiptoExp = expandedShiptoUnico === s.unico;
${I}                                            return (
${I}                                                <Fragment key={s.unico}>
${I}                                                    <PanelGridTr selected={isShiptoSel} onClick={() => setSelShipto(s)}>
${I}                                                        <PanelGridTd className="w-6 pl-1 pr-0">
${I}                                                            <button onClick={e => { e.stopPropagation(); if (isShiptoExp) { setExpandedShiptoUnico(null); } else { setSelShipto(s); setExpandedShiptoUnico(s.unico); } }}
${I}                                                                className="p-0.5 rounded hover:bg-gray-200 transition-colors">
${I}                                                                <ChevronRight size={11} className={cn("text-gray-400 transition-transform duration-150", isShiptoExp && "rotate-90 text-[#FB7506]")} />
${I}                                                            </button>
${I}                                                        </PanelGridTd>
${I}                                                        <PanelGridTd className="font-mono">{s.shipto}</PanelGridTd>
${I}                                                        <PanelGridTd className="font-medium max-w-[140px] truncate">{t(s.name)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden sm:table-cell max-w-[140px] truncate">{t(s.address1)}</PanelGridTd>
${I}                                                        <PanelGridTd>{t(s.city)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden md:table-cell">{t(s.state)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden md:table-cell">{t(s.zip)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden lg:table-cell">{t(s.country)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden lg:table-cell max-w-[100px] truncate">{t(s.contact)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden xl:table-cell whitespace-nowrap">{t(s.phone)}</PanelGridTd>
${I}                                                        <PanelGridTd>{t(s.zone)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden sm:table-cell">{t(s.route)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{s.hours24 ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{s.truck_days||0}</PanelGridTd>
${I}                                                    </PanelGridTr>
${I}                                                    {isShiptoExp && (
${I}                                                        <tr>
${I}                                                            <td colSpan={14} className="p-0 border-b border-gray-200">
${I}                                                                <div className="pl-6 pr-2 py-2 bg-gray-100">
${I}                                                                    <PanelGrid
${I}                                                                        title="Carriers by Ship-to"
${I}                                                                        icon={Truck}
${I}                                                                        recordCount={(carriers as any[]).length}
${I}                                                                        headerRight={<AuditLogModal recordId={selCarrier?.unico} disabled={!selCarrier?.unico} bareButton />}
${I}                                                                        menuItems={[
${I}                                                                            { label: "Add Carrier", icon: Plus, color: "green", onClick: () => { setCarrierForm({...EMPTY_CARRIER}); setFormError(null); setCarrierModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
${I}                                                                            { label: "Edit Carrier", icon: Pencil, color: "orange", onClick: () => { if(!selCarrier) return; setCarrierForm({carrier_uq:t(selCarrier.carrier_uq), account:t(selCarrier.account), zone:t(selCarrier.zone), mon:!!selCarrier.mon, tue:!!selCarrier.tue, wed:!!selCarrier.wed, thu:!!selCarrier.thu, fri:!!selCarrier.fri, sat:!!selCarrier.sat, sun:!!selCarrier.sun}); setFormError(null); setCarrierModal({ mode:"edit" }); }, disabled: !selCarrier || !perms.canEdit },
${I}                                                                            { label: "Delete Carrier", icon: Trash2, color: "orange", onClick: () => { if(selCarrier) { setFormError(null); setCarrierModal({ mode:"delete" }); } }, disabled: !selCarrier || !perms.canDelete },
${I}                                                                            { separator: true },
${I}                                                                            { label: "Set Default", icon: Star, color: "gray", onClick: setDefaultCarrier, disabled: !selCarrier },
${I}                                                                        ]}
${I}                                                                    >
${I}                                                                        <PanelGridTable>
${I}                                                                            <PanelGridThead>
${I}                                                                                <PanelGridTh>Carrier</PanelGridTh>
${I}                                                                                <PanelGridTh>Account</PanelGridTh>
${I}                                                                                <PanelGridTh className="hidden sm:table-cell">Ship-to</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Zone</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Default</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Mon</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Tue</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Wed</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Thu</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Fri</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Sat</PanelGridTh>
${I}                                                                                <PanelGridTh align="center">Sun</PanelGridTh>
${I}                                                                            </PanelGridThead>
${I}                                                                            <PanelGridTbody>
${I}                                                                                {(carriers as any[]).length === 0
${I}                                                                                    ? <tr><td colSpan={12} className="p-6 text-center text-gray-300 text-xs">{loadingCarriers ? "Loading..." : "No carriers"}</td></tr>
${I}                                                                                    : (carriers as any[]).map((car: any) => {
${I}                                                                                        const isCarSel = selCarrier?.unico === car.unico;
${I}                                                                                        return (
${I}                                                                                            <PanelGridTr key={car.unico} selected={isCarSel} onClick={() => setSelCarrier(car)}>
${I}                                                                                                <PanelGridTd className="font-medium">{t(car.carrier)}</PanelGridTd>
${I}                                                                                                <PanelGridTd>{t(car.account)}</PanelGridTd>
${I}                                                                                                <PanelGridTd className="hidden sm:table-cell max-w-[100px] truncate">{t(car.ship_name)}</PanelGridTd>
${I}                                                                                                <PanelGridTd align="center">{t(car.zone)}</PanelGridTd>
${I}                                                                                                {["defa_carrier","mon","tue","wed","thu","fri","sat","sun"].map(d => (
${I}                                                                                                    <PanelGridTd key={d} align="center">
${I}                                                                                                        {car[d] ? <Check size={10} className={d==="defa_carrier"?"text-amber-500 mx-auto":"text-green-500 mx-auto"} /> : <span className="text-gray-200">{"—"}</span>}
${I}                                                                                                    </PanelGridTd>
${I}                                                                                                ))}
${I}                                                                                            </PanelGridTr>
${I}                                                                                        );
${I}                                                                                    })
${I}                                                                                }
${I}                                                                            </PanelGridTbody>
${I}                                                                        </PanelGridTable>
${I}                                                                    </PanelGrid>
${I}                                                                </div>
${I}                                                            </td>
${I}                                                        </tr>
${I}                                                    )}
${I}                                                </Fragment>
${I}                                            );
${I}                                        })
${I}                                    }
${I}                                </PanelGridTbody>
${I}                            </PanelGridTable>
${I}                        </PanelGrid>
${I}                    </div>
${I}                )}
${I}                {/* ── Statement tab ── */}
${I}                {activeExpTab === "statement" && (
${I}                    <div className="px-4 py-2 flex flex-col gap-2">
${I}                        <PanelGrid
${I}                            title="Account Statement"
${I}                            icon={FileText}
${I}                            recordCount={(statement as any[]).length}
${I}                            onRefresh={() => { setStmtEnabled(true); refetchStmt(); }}
${I}                            refreshing={loadingStmt}
${I}                            headerRight={
${I}                                <div className="flex items-center gap-2">
${I}                                    <input type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
${I}                                    <span className="text-gray-400 text-[9px]">{"→"}</span>
${I}                                    <input type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)} className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
${I}                                </div>
${I}                            }
${I}                        >
${I}                            <div className="overflow-auto">
${I}                                {!stmtEnabled ? <div className="h-32 flex items-center justify-center text-gray-300 text-xs font-bold uppercase">Select date range and click Load</div>
${I}                                : (statement as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingStmt ? "Loading..." : "No statement records"}</div>
${I}                                : (
${I}                                    <PanelGridTable>
${I}                                        <PanelGridThead>
${I}                                            <PanelGridTh>Type</PanelGridTh>
${I}                                            <PanelGridTh>Doc No.</PanelGridTh>
${I}                                            <PanelGridTh>Date</PanelGridTh>
${I}                                            <PanelGridTh>Due Date</PanelGridTh>
${I}                                            <PanelGridTh align="right">Amount</PanelGridTh>
${I}                                            <PanelGridTh align="right">Payments</PanelGridTh>
${I}                                            <PanelGridTh align="right">Debits</PanelGridTh>
${I}                                            <PanelGridTh align="right">Credits</PanelGridTh>
${I}                                            <PanelGridTh align="right">Balance</PanelGridTh>
${I}                                        </PanelGridThead>
${I}                                        <PanelGridTbody>
${I}                                            {(statement as any[]).map((row: any, i: number) => (
${I}                                                <PanelGridTr key={i}>
${I}                                                    <PanelGridTd className="font-medium">{t(row.type)}</PanelGridTd>
${I}                                                    <PanelGridTd className="font-mono">{t(row.invoice_no)}</PanelGridTd>
${I}                                                    <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(row.fecha||row.date))}</PanelGridTd>
${I}                                                    <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(row.due_date))}</PanelGridTd>
${I}                                                    <PanelGridTd align="right" className="text-blue-700">{formatMoney(row.ammount)}</PanelGridTd>
${I}                                                    <PanelGridTd align="right" className="text-green-600">{formatMoney(row.payments)}</PanelGridTd>
${I}                                                    <PanelGridTd align="right" className="text-red-500">{formatMoney(row.debits)}</PanelGridTd>
${I}                                                    <PanelGridTd align="right" className="text-blue-600">{formatMoney(row.credits)}</PanelGridTd>
${I}                                                    <PanelGridTd align="right" className="font-semibold text-[#FB7506]">{formatMoney(row.balance)}</PanelGridTd>
${I}                                                </PanelGridTr>
${I}                                            ))}
${I}                                        </PanelGridTbody>
${I}                                    </PanelGridTable>
${I}                                )}
${I}                            </div>
${I}                        </PanelGrid>
${I}                    </div>
${I}                )}
${I}                {/* ── Web Users tab ── */}
${I}                {activeExpTab === "webusers" && (
${I}                    <div className="px-4 py-2 flex flex-col gap-2">
${I}                        <PanelGrid
${I}                            title="Web Users / Portal"
${I}                            icon={Users}
${I}                            recordCount={(webUsers as any[]).length}
${I}                            headerRight={<AuditLogModal recordId={selWebUser?.unico} disabled={!selWebUser?.unico} bareButton />}
${I}                            menuItems={[
${I}                                { label: "Add User", icon: Plus, color: "green", onClick: () => { setWebUserForm({...EMPTY_WEBUSER}); setFormError(null); setWebUserModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
${I}                                { label: "Edit User", icon: Pencil, color: "orange", onClick: () => { if(!selWebUser) return; setWebUserForm({fname:t(selWebUser.fname),lname:t(selWebUser.lname),username:t(selWebUser.username),password:t(selWebUser.password),active:!!selWebUser.active,makeinvoice:!!selWebUser.makeinvoice,makeprebook:!!selWebUser.makeprebook,makecredit:!!selWebUser.makecredit,viewaccount:!!selWebUser.viewaccount,viewproducts:!!selWebUser.viewproducts,viewhistory:!!selWebUser.viewhistory,email:t(selWebUser.email),phone:t(selWebUser.phone)}); setFormError(null); setWebUserModal({ mode:"edit" }); }, disabled: !selWebUser || !perms.canEdit },
${I}                                { label: "Delete User", icon: Trash2, color: "orange", onClick: () => { if(selWebUser) { setFormError(null); setWebUserModal({ mode:"delete" }); } }, disabled: !selWebUser || !perms.canDelete },
${I}                            ]}
${I}                        >
${I}                            <div className="overflow-auto">
${I}                                {(webUsers as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingWebUsers ? "Loading..." : "No web users"}</div> : (
${I}                                    <PanelGridTable>
${I}                                        <PanelGridThead>
${I}                                            <PanelGridTh>User</PanelGridTh>
${I}                                            <PanelGridTh>Login</PanelGridTh>
${I}                                            <PanelGridTh align="center">Active</PanelGridTh>
${I}                                            <PanelGridTh align="center">Invoices</PanelGridTh>
${I}                                            <PanelGridTh align="center">Prebooks</PanelGridTh>
${I}                                            <PanelGridTh align="center">Credits</PanelGridTh>
${I}                                            <PanelGridTh align="center">Accounts</PanelGridTh>
${I}                                            <PanelGridTh align="center">Products</PanelGridTh>
${I}                                            <PanelGridTh align="center">History</PanelGridTh>
${I}                                            <PanelGridTh className="hidden md:table-cell">Phone</PanelGridTh>
${I}                                            <PanelGridTh className="hidden md:table-cell">Email</PanelGridTh>
${I}                                        </PanelGridThead>
${I}                                        <PanelGridTbody>
${I}                                            {(webUsers as any[]).map((u: any) => {
${I}                                                const isSel = selWebUser?.unico === u.unico;
${I}                                                const yn = (v: any) => v ? <Check size={10} className="text-green-500" /> : <span className="text-gray-200">{"—"}</span>;
${I}                                                return (
${I}                                                    <PanelGridTr key={u.unico} selected={isSel} onClick={() => setSelWebUser(u)}>
${I}                                                        <PanelGridTd className="font-medium">{t(u.fullname)}</PanelGridTd>
${I}                                                        <PanelGridTd className="font-mono text-[10px]">{t(u.username)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.active)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.makeinvoice)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.makeprebook)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.makecredit)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.viewaccount)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.viewproducts)}</PanelGridTd>
${I}                                                        <PanelGridTd align="center">{yn(u.viewhistory)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden md:table-cell">{t(u.phone)}</PanelGridTd>
${I}                                                        <PanelGridTd className="hidden md:table-cell text-gray-400 truncate max-w-[140px]">{t(u.email)}</PanelGridTd>
${I}                                                    </PanelGridTr>
${I}                                                );
${I}                                            })}
${I}                                        </PanelGridTbody>
${I}                                    </PanelGridTable>
${I}                                )}
${I}                            </div>
${I}                        </PanelGrid>
${I}                    </div>
${I}                )}
${I}                {/* ── Messages tab ── */}
${I}                {activeExpTab === "messages" && (
${I}                    <div className="px-4 py-2 flex flex-col gap-2">
${I}                        <PanelGrid
${I}                            title="Messages & Comments"
${I}                            icon={MessageSquare}
${I}                            recordCount={(messages as any[]).length}
${I}                            headerRight={<AuditLogModal recordId={selMessage?.unico} disabled={!selMessage?.unico} bareButton />}
${I}                            menuItems={[
${I}                                { label: "Add Message", icon: Plus, color: "green", onClick: () => { setMsgForm({ comments:"", deadline:"", user_to:"" }); setFormError(null); setMsgModal(true); }, disabled: !selCust || !perms.canCreate },
${I}                            ]}
${I}                        >
${I}                            <div className="overflow-auto">
${I}                                {(messages as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingMsgs ? "Loading..." : "No messages"}</div> : (
${I}                                    <PanelGridTable>
${I}                                        <PanelGridThead>
${I}                                            <PanelGridTh>Message</PanelGridTh>
${I}                                            <PanelGridTh>Date</PanelGridTh>
${I}                                            <PanelGridTh>Deadline</PanelGridTh>
${I}                                            <PanelGridTh>Taken By</PanelGridTh>
${I}                                            <PanelGridTh>To</PanelGridTh>
${I}                                        </PanelGridThead>
${I}                                        <PanelGridTbody>
${I}                                            {(messages as any[]).map((m: any, i: number) => {
${I}                                                const isSel = selMessage?.unico === m.unico;
${I}                                                return (
${I}                                                    <PanelGridTr key={m.unico||i} selected={isSel} onClick={() => setSelMessage(m)}>
${I}                                                        <PanelGridTd className="truncate max-w-[300px]">{t(m.grid_message)}</PanelGridTd>
${I}                                                        <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(m.add_date))}</PanelGridTd>
${I}                                                        <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(m.deadline))}</PanelGridTd>
${I}                                                        <PanelGridTd>{t(m.taken_by)}</PanelGridTd>
${I}                                                        <PanelGridTd>{t(m.user_destination)}</PanelGridTd>
${I}                                                    </PanelGridTr>
${I}                                                );
${I}                                            })}
${I}                                        </PanelGridTbody>
${I}                                    </PanelGridTable>
${I}                                )}
${I}                            </div>
${I}                        </PanelGrid>
${I}                    </div>
${I}                )}
${I}            </div>
${I}        </td>
${I}    </tr>
${I})}`.split('\n')
);

// Replace lines custExpStart..custExpEnd with new block
lines.splice(custExpStart, custExpEnd - custExpStart + 1, ...newExpLines);

// Recalculate line numbers after splice
const linesAdded = newExpLines.length - (custExpEnd - custExpStart + 1);
const newTabsAreaStart = tabsAreaStart + linesAdded;
const newTabsAreaEnd = tabsAreaEnd + linesAdded;
const newAppFooterLine = appFooterLine + linesAdded;

console.log(`After splice: Tabs area now at lines ${newTabsAreaStart + 1}–${newTabsAreaEnd + 1}`);
console.log(`AppFooter now at: ${newAppFooterLine + 1}`);

// Remove tabs area (from tabsAreaStart to tabsAreaEnd inclusive)
lines.splice(newTabsAreaStart, newTabsAreaEnd - newTabsAreaStart + 1);

writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done! Lines written:', lines.length);
