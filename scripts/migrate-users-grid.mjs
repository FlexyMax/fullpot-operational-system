import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/app/system/users/page.tsx';
let c = readFileSync(filePath, 'utf8');

// Convert Activity Log header to PanelGrid
const oldLog = `                    {/* Activity Log */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[200px] lg:min-h-0">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">User Activity Log</span>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {loadingLog && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                            </div>
                            {/* Date filters — view mode only */}
                            {mode === "view" && (
                                <div className="flex items-center gap-2 pr-2">
                                    <input type="date" value={logFrom} onChange={e => setLogFrom(e.target.value)}
                                        className="bg-gray-600 text-white text-xs border-none outline-none rounded px-2 h-8 w-32" />
                                    <span className="text-gray-400 text-xs">→</span>
                                    <input type="date" value={logTo} onChange={e => setLogTo(e.target.value)}
                                        className="bg-gray-600 text-white text-xs border-none outline-none rounded px-2 h-8 w-32" />
                                    <button onClick={() => { setLogEnabled(true); refetchLog(); }}
                                        className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 text-white px-3 h-8 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        <Filter size={14} /> Filter
                                    </button>
                                </div>
                            )}
                        </div>`;

const newLog = `                    <PanelGrid
                        title="User Activity Log"
                        icon={Calendar}
                        refreshing={loadingLog}
                        headerRight={
                            <>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} bareButton />
                                {mode === "view" && (
                                    <div className="flex items-center gap-2">
                                        <input type="date" value={logFrom} onChange={e => setLogFrom(e.target.value)}
                                            className="bg-gray-600 text-white text-xs border-none outline-none rounded px-2 h-8 w-32" />
                                        <span className="text-gray-400 text-xs">→</span>
                                        <input type="date" value={logTo} onChange={e => setLogTo(e.target.value)}
                                            className="bg-gray-600 text-white text-xs border-none outline-none rounded px-2 h-8 w-32" />
                                        <button onClick={() => { setLogEnabled(true); refetchLog(); }}
                                            className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 text-white px-3 h-8 rounded text-xs font-black uppercase tracking-wider transition-all">
                                            <Filter size={14} /> Filter
                                        </button>
                                    </div>
                                )}
                            </>
                        }
                        className="flex-1 min-h-[200px] lg:min-h-0"
                    >`;

if (!c.includes(oldLog)) {
    console.error('LOG SECTION NOT FOUND');
    process.exit(1);
}

c = c.replace(oldLog, newLog);

// Fix closing: the log section ends with </div> that should be </PanelGrid>
// Find the pattern: records count bar + closing div + closing div for right panel
const oldLogClose = `                        </div>
                    </div>
                </div>
            </div>

            <AppFooter`;

const newLogClose = `                        </div>
                    </PanelGrid>
                </div>
            </div>

            <AppFooter`;

if (!c.includes(oldLogClose)) {
    console.error('LOG CLOSE NOT FOUND');
    process.exit(1);
}

c = c.replace(oldLogClose, newLogClose);

writeFileSync(filePath, c);
console.log('OK - Activity Log header migrated to PanelGrid');
