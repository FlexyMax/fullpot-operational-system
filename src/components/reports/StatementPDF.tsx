import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { CompanyInfo } from "@/lib/reports/companyInfo";

Font.registerHyphenationCallback(word => [word]);

const ACCENT  = "#FB7506";
const DARK    = "#1E2633";
const GRAY    = "#6B7280";
const LGRAY   = "#E5E7EB";
const BGLIGHT = "#F9FAFB";
const RED     = "#DC2626";
const GREEN   = "#059669";
const BLUE    = "#1D4ED8";
const WHITE   = "#FFFFFF";
const OLIGHT  = "#FFF7ED";

const s = StyleSheet.create({
    page:      { paddingBottom: 44, fontSize: 8, fontFamily: "Helvetica", color: "#1F2937", backgroundColor: WHITE },

    // ── White header ─────────────────────────────────────────────────────────
    headerBand:   { backgroundColor: WHITE, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12,
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    borderBottomWidth: 3, borderBottomColor: ACCENT, marginBottom: 14 },
    logoWrap:     { flexDirection: "row", alignItems: "center" },
    logo:         { width: 62, height: 62 },
    coBlock:      { marginLeft: 10 },
    coName:       { fontSize: 14, fontWeight: 700, color: DARK },
    coSub:        { fontSize: 6.5, color: GRAY, marginTop: 2 },
    titleBlock:   { alignItems: "flex-end" },
    docTitle:     { fontSize: 13, fontWeight: 700, color: DARK, textTransform: "uppercase" },
    docBar:       { width: 56, height: 2, backgroundColor: ACCENT, marginTop: 4, alignSelf: "flex-end" },
    docSub:       { fontSize: 7, color: GRAY, marginTop: 4 },
    docBadge:     { marginTop: 5, backgroundColor: OLIGHT, borderRadius: 3,
                    paddingHorizontal: 6, paddingVertical: 2,
                    borderWidth: 1, borderColor: ACCENT },
    docBadgeTx:   { fontSize: 7, fontWeight: 700, color: ACCENT },

    // ── Body ─────────────────────────────────────────────────────────────────
    body:         { paddingHorizontal: 28 },

    // ── Info cards ───────────────────────────────────────────────────────────
    infoRow:      { flexDirection: "row", marginBottom: 10 },
    infoCard:     { flex: 1, borderRadius: 3, padding: 7,
                    borderWidth: 1, borderColor: LGRAY, borderStyle: "solid",
                    backgroundColor: BGLIGHT, marginRight: 8 },
    infoCardLast: { flex: 1, borderRadius: 3, padding: 7,
                    borderWidth: 1, borderColor: LGRAY, borderStyle: "solid",
                    backgroundColor: BGLIGHT },
    infoAccent:   { borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 7 },
    infoLabel:    { fontSize: 6, fontWeight: 700, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
    infoValue:    { fontSize: 8.5, fontWeight: 700, color: DARK },
    infoLine:     { fontSize: 7, color: GRAY, marginTop: 1 },

    // ── Aging / monthly strip ─────────────────────────────────────────────────
    strip:        { flexDirection: "row", backgroundColor: DARK, borderRadius: 4, marginBottom: 10, minHeight: 38 },
    stripCell:    { flex: 1, paddingVertical: 7, paddingHorizontal: 4, alignItems: "center", justifyContent: "center",
                    borderRightWidth: 1, borderRightColor: "#374151" },
    stripCellEnd: { flex: 1, paddingVertical: 7, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" },
    stripLabel:   { fontSize: 5.5, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 2, textAlign: "center" },
    stripAmt:     { fontSize: 8.5, fontWeight: 700, color: WHITE },
    stripAmtHL:   { fontSize: 8.5, fontWeight: 700, color: ACCENT },

    // ── Notes ────────────────────────────────────────────────────────────────
    notesBox:     { marginBottom: 10, padding: 7, backgroundColor: OLIGHT, borderRadius: 3,
                    borderLeftWidth: 3, borderLeftColor: ACCENT },
    notesText:    { fontSize: 7, color: "#374151" },

    // ── Table ────────────────────────────────────────────────────────────────
    thead:        { flexDirection: "row", backgroundColor: DARK, paddingVertical: 5 },
    th:           { fontSize: 6.5, fontWeight: 700, color: "#D1D5DB", textTransform: "uppercase", paddingHorizontal: 4 },
    tr:           { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LGRAY, borderBottomStyle: "solid", paddingVertical: 3.5 },
    trAlt:        { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LGRAY, borderBottomStyle: "solid", paddingVertical: 3.5, backgroundColor: BGLIGHT },
    td:           { fontSize: 7.5, paddingHorizontal: 4, color: "#374151" },
    tdR:          { fontSize: 7.5, paddingHorizontal: 4, color: "#374151", textAlign: "right" },

    // ── Totals ───────────────────────────────────────────────────────────────
    totRow:       { flexDirection: "row", backgroundColor: OLIGHT,
                    borderTopWidth: 2, borderTopColor: ACCENT, borderTopStyle: "solid", paddingVertical: 4 },
    totLabel:     { fontSize: 7.5, fontWeight: 700, color: DARK, paddingHorizontal: 4 },
    totAmt:       { fontSize: 7.5, fontWeight: 700, color: ACCENT, paddingHorizontal: 4, textAlign: "right" },
    totAmtG:      { fontSize: 7.5, fontWeight: 700, color: GREEN,  paddingHorizontal: 4, textAlign: "right" },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer:       { position: "absolute", bottom: 14, left: 28, right: 28,
                    flexDirection: "row", justifyContent: "space-between",
                    fontSize: 6.5, color: "#9CA3AF",
                    borderTopWidth: 1, borderTopColor: LGRAY, borderTopStyle: "solid", paddingTop: 3 },
});

const c    = (v: any) => String(v ?? "").trim();
const fmtN = (v: any) => {
    const n = parseFloat(v);
    return isNaN(n) ? "—" : "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtD = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? c(v) : d.toLocaleDateString("en-US");
};
const flex = (w: number) => ({ flexGrow: w, flexBasis: 0 as const, flexShrink: 1 });

const LOGO_SRC = typeof process !== "undefined"
    ? require("path").join(process.cwd(), "public", "fullpot-logo.png")
    : "";

interface Props {
    company:   CompanyInfo;
    rows:      any[];
    fromDate?: string;
    toDate?:   string;
    mode?:     "statement" | "balance";
}

export function StatementPDF({ company, rows, fromDate, toDate, mode = "statement" }: Props) {
    if (!rows.length) return (
        <Document>
            <Page size="LETTER" style={s.page}>
                <View style={s.body}><Text>No statement data available.</Text></View>
            </Page>
        </Document>
    );

    const h = rows[0];

    // Customer info
    const customer     = c(h.customer);
    const custCode     = c(h.code || h.old_code);
    const address1     = c(h.address1);
    const address2     = c(h.address2);
    const cityStateZip = [c(h.city), c(h.state), c(h.zip)].filter(Boolean).join(", ");
    const contact      = c(h.contact);
    const phone        = c(h.phone_1);
    const fax          = c(h.fax_1);
    const terms        = c(h.terms);
    const stmtNotes    = c(h.statement_notes);
    const unapply      = parseFloat(h.total_unapply) || 0;

    // Aging buckets — same values on every row for BOTH SPs
    const t0_30   = parseFloat(h.t0_30)   || 0;
    const t30_60  = parseFloat(h.t30_60)  || 0;
    const t60_90  = parseFloat(h.t60_90)  || 0;
    const t90_120 = parseFloat(h.t90_120) || 0;
    const t120    = parseFloat(h.t120)    || 0;

    // Balance mode: SP already provides monthly bucket labels
    const month1Label    = c(h.month_1)    || "Current";
    const month2Label    = c(h.month_2)    || "Prior";
    const month3Label    = c(h.month_3)    || "2 Months";
    const month4Label    = c(h.month_4)    || "3 Months";
    const month4plusLabel = c(h.month_4plus) || "Older";

    // Total due
    const stripTotal = t0_30 + t30_60 + t60_90 + t90_120 + t120;
    const totalDue   = mode === "balance"
        ? stripTotal   // SP buckets already represent the full net balance
        : t0_30 + t30_60 + t60_90 + t90_120 + t120;

    // Tx rows (statement: skip row 0 "Last Balance" header row)
    const txRows     = mode === "statement" ? rows.slice(1) : rows;
    const totDebits  = txRows.reduce((s, r) => s + (parseFloat(r.debits)  || 0), 0);
    const totCredits = txRows.reduce((s, r) => s + (parseFloat(r.credits) || 0), 0);

    const dateLabel = fromDate && toDate
        ? `Period: ${fmtD(fromDate)} – ${fmtD(toDate)}`
        : `As of ${new Date().toLocaleDateString("en-US")}`;

    return (
        <Document title={`Statement — ${customer}`}>
            <Page size="LETTER" orientation="portrait" style={s.page}>

                {/* ── White header with logo ── */}
                <View style={s.headerBand}>
                    <View style={s.logoWrap}>
                        {!!LOGO_SRC && <Image src={LOGO_SRC} style={s.logo} />}
                        <View style={s.coBlock}>
                            <Text style={s.coName}>{c(company.name) || "FULL POT OF FLOWERS"}</Text>
                            {company.address      && <Text style={s.coSub}>{company.address}</Text>}
                            {company.cityStateZip && <Text style={s.coSub}>{company.cityStateZip}</Text>}
                            {company.phone        && (
                                <Text style={s.coSub}>
                                    Tel: {company.phone}{company.fax ? `   Fax: ${company.fax}` : ""}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={s.titleBlock}>
                        <Text style={s.docTitle}>Account Statement</Text>
                        <View style={s.docBar} />
                        <Text style={s.docSub}>{dateLabel}</Text>
                        {mode === "balance" && (
                            <View style={s.docBadge}>
                                <Text style={s.docBadgeTx}>Open Invoices Only</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={s.body}>

                    {/* ── Customer + contact + balance cards ── */}
                    <View style={s.infoRow}>
                        <View style={[s.infoCard, s.infoAccent, { flex: 2 }]}>
                            <Text style={s.infoLabel}>Bill To</Text>
                            <Text style={s.infoValue}>{customer}{custCode ? ` — ${custCode}` : ""}</Text>
                            {address1     && <Text style={s.infoLine}>{address1}</Text>}
                            {address2     && <Text style={s.infoLine}>{address2}</Text>}
                            {cityStateZip && <Text style={s.infoLine}>{cityStateZip}</Text>}
                            {terms        && <Text style={[s.infoLine, { marginTop: 4, fontWeight: 700 }]}>Terms: {terms}</Text>}
                        </View>
                        <View style={s.infoCard}>
                            <Text style={s.infoLabel}>Contact</Text>
                            {contact && <Text style={s.infoValue}>{contact}</Text>}
                            {phone   && <Text style={s.infoLine}>P: {phone}</Text>}
                            {fax     && <Text style={s.infoLine}>F: {fax}</Text>}
                        </View>
                        <View style={[s.infoCardLast, s.infoAccent]}>
                            <Text style={s.infoLabel}>Balance Due</Text>
                            <Text style={[s.infoValue, { fontSize: 14, color: totalDue > 0 ? RED : GREEN }]}>
                                {fmtN(totalDue)}
                            </Text>
                            {unapply < 0 && <Text style={[s.infoLine, { color: GREEN }]}>Credit: {fmtN(unapply)}</Text>}
                        </View>
                    </View>

                    {/* ── Aging strip — statement mode (day-based: 0-30 / 31-60 / 61-90 / 91-120 / 120+) ── */}
                    {mode === "statement" && (
                        <View style={s.strip}>
                            {(
                                [
                                    { label: "Current\n0 – 30 Days", val: t0_30   },
                                    { label: "31 – 60 Days",         val: t30_60  },
                                    { label: "61 – 90 Days",         val: t60_90  },
                                    { label: "91 – 120 Days",        val: t90_120 },
                                    { label: "Over 120 Days",        val: t120    },
                                ] as { label: string; val: number }[]
                            ).map(({ label, val }, i) => (
                                <View key={i} style={s.stripCell}>
                                    <Text style={s.stripLabel}>{label}</Text>
                                    <Text style={s.stripAmt}>{fmtN(val)}</Text>
                                </View>
                            ))}
                            <View style={s.stripCellEnd}>
                                <Text style={s.stripLabel}>Total Balance Due</Text>
                                <Text style={s.stripAmtHL}>{fmtN(stripTotal)}</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Monthly balance strip — balance mode (uses SP-provided month labels + buckets) ── */}
                    {mode === "balance" && (
                        <View style={s.strip}>
                            <View style={s.stripCell}>
                                <Text style={s.stripLabel}>{month1Label}</Text>
                                <Text style={s.stripAmt}>{fmtN(t0_30)}</Text>
                            </View>
                            <View style={s.stripCell}>
                                <Text style={s.stripLabel}>{month2Label}</Text>
                                <Text style={s.stripAmt}>{fmtN(t30_60)}</Text>
                            </View>
                            <View style={s.stripCell}>
                                <Text style={s.stripLabel}>{month3Label}</Text>
                                <Text style={s.stripAmt}>{fmtN(t60_90)}</Text>
                            </View>
                            <View style={s.stripCell}>
                                <Text style={s.stripLabel}>{month4Label}</Text>
                                <Text style={s.stripAmt}>{fmtN(t90_120)}</Text>
                            </View>
                            <View style={s.stripCell}>
                                <Text style={s.stripLabel}>{month4plusLabel}</Text>
                                <Text style={s.stripAmt}>{fmtN(t120)}</Text>
                            </View>
                            <View style={s.stripCellEnd}>
                                <Text style={s.stripLabel}>Total Balance Due</Text>
                                <Text style={s.stripAmtHL}>{fmtN(stripTotal)}</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Statement notes ── */}
                    {!!stmtNotes && (
                        <View style={s.notesBox}>
                            <Text style={s.notesText}>{stmtNotes}</Text>
                        </View>
                    )}

                    {/* ── Transaction table ── */}
                    <View style={s.thead}>
                        <Text style={[s.th, flex(1.2)]}>Date</Text>
                        <Text style={[s.th, flex(2.5)]}>Type / Description</Text>
                        <Text style={[s.th, flex(1.5)]}>Document #</Text>
                        {mode === "balance"    && <Text style={[s.th, flex(1.5)]}>Due Date</Text>}
                        {mode === "statement"  && <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Debits</Text>}
                        {mode === "statement"  && <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Credits</Text>}
                        <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Balance</Text>
                    </View>

                    {rows.map((row, i) => {
                        const bal  = parseFloat(row.balance) || 0;
                        const deb  = parseFloat(row.debits)  || 0;
                        const cred = parseFloat(row.credits) || 0;
                        const inv  = row.invoice_no && String(row.invoice_no).trim() !== "0"
                            ? String(row.invoice_no).trim() : "";
                        const dateVal = row.date || row.fecha;
                        return (
                            <View key={i} style={i % 2 === 0 ? s.tr : s.trAlt} wrap={false}>
                                <Text style={[s.td,  flex(1.2)]}>{fmtD(dateVal)}</Text>
                                <Text style={[s.td,  flex(2.5), { fontWeight: 700 }]}>{c(row.type)}</Text>
                                <Text style={[s.td,  flex(1.5), { color: BLUE }]}>{inv}</Text>
                                {mode === "balance"   && <Text style={[s.td, flex(1.5), { color: GRAY }]}>{c(row.due_date)}</Text>}
                                {mode === "statement" && (
                                    <Text style={[s.tdR, flex(1.2), { color: deb  > 0 ? RED   : "#374151" }]}>
                                        {deb  > 0 ? fmtN(deb)  : ""}
                                    </Text>
                                )}
                                {mode === "statement" && (
                                    <Text style={[s.tdR, flex(1.2), { color: cred > 0 ? GREEN : "#374151" }]}>
                                        {cred > 0 ? fmtN(cred) : ""}
                                    </Text>
                                )}
                                <Text style={[s.tdR, flex(1.2), { color: bal > 0 ? RED : "#374151", fontWeight: 700 }]}>
                                    {fmtN(bal)}
                                </Text>
                            </View>
                        );
                    })}

                    {/* ── Totals row ── */}
                    <View style={s.totRow}>
                        <Text style={[s.totLabel, flex(1.2 + 2.5 + 1.5 + (mode === "balance" ? 1.5 : 0))]}>
                            TOTAL — {rows.length} {mode === "balance" ? "open invoices" : "transactions"}
                        </Text>
                        {mode === "statement" && (
                            <>
                                <Text style={[s.totAmt,  flex(1.2)]}>{fmtN(totDebits)}</Text>
                                <Text style={[s.totAmtG, flex(1.2)]}>{fmtN(totCredits)}</Text>
                            </>
                        )}
                        <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totalDue)}</Text>
                    </View>

                </View>

                {/* ── Page footer ── */}
                <View style={s.footer} fixed>
                    <Text>Generated {new Date().toLocaleString("en-US")} — {c(company.name)}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>

            </Page>
        </Document>
    );
}
