import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { CompanyInfo } from "@/lib/reports/companyInfo";

Font.registerHyphenationCallback(word => [word]);

const ACCENT = "#FB7506";
const DARK   = "#1E2633";
const GRAY   = "#6B7280";
const BORDER = "#E5E7EB";
const RED    = "#DC2626";
const GREEN  = "#059669";
const BLUE   = "#1D4ED8";

const s = StyleSheet.create({
    page:       { padding: "0 0 40 0", fontSize: 8, fontFamily: "Helvetica", color: "#1F2937", backgroundColor: "#FFF" },

    // ── Dark header band ──────────────────────────────────────────────────────
    headerBand: { backgroundColor: DARK, paddingHorizontal: 28, paddingTop: 14, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    logoWrap:   { flexDirection: "row", alignItems: "center", gap: 8 },
    logo:       { width: 56, height: 56, objectFit: "contain" },
    coBlock:    { flexDirection: "column" },
    coName:     { fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: 0.5 },
    coSub:      { fontSize: 6.5, color: "#9CA3AF", marginTop: 1 },
    titleBlock: { alignItems: "flex-end" },
    docTitle:   { fontSize: 12, fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 },
    docSub:     { fontSize: 7, color: "#9CA3AF", marginTop: 3 },

    // ── Body padding ─────────────────────────────────────────────────────────
    body:       { paddingHorizontal: 28 },

    // ── Info cards ───────────────────────────────────────────────────────────
    infoRow:    { flexDirection: "row", gap: 8, marginBottom: 10 },
    infoCard:   { flex: 1, borderRadius: 3, padding: 7, border: "0.75 solid #E5E7EB", backgroundColor: "#F9FAFB" },
    infoAccent: { borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 7 },
    infoLabel:  { fontSize: 6, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
    infoValue:  { fontSize: 8.5, fontWeight: 700, color: DARK },
    infoLine:   { fontSize: 7, color: GRAY, marginTop: 1 },

    // ── Aging strip ──────────────────────────────────────────────────────────
    agingRow:   { flexDirection: "row", backgroundColor: DARK, borderRadius: 4, marginBottom: 10, overflow: "hidden" },
    agingCell:  { flex: 1, paddingVertical: 6, paddingHorizontal: 4, alignItems: "center", borderRightWidth: 0.5, borderRightColor: "#374151" },
    agingLabel: { fontSize: 6, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 },
    agingAmt:   { fontSize: 8, fontWeight: 700, color: "#FFFFFF" },
    agingAmtHL: { fontSize: 8, fontWeight: 700, color: ACCENT },

    // ── Table ────────────────────────────────────────────────────────────────
    thead:      { flexDirection: "row", backgroundColor: DARK, paddingVertical: 5 },
    th:         { fontSize: 6.5, fontWeight: 700, color: "#D1D5DB", textTransform: "uppercase", letterSpacing: 0.3, paddingHorizontal: 4 },
    tr:         { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3.5 },
    trAlt:      { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3.5, backgroundColor: "#F9FAFB" },
    td:         { fontSize: 7.5, paddingHorizontal: 4, color: "#374151" },
    tdR:        { fontSize: 7.5, paddingHorizontal: 4, color: "#374151", textAlign: "right" },

    // ── Totals row ───────────────────────────────────────────────────────────
    totRow:     { flexDirection: "row", backgroundColor: "#FFF7ED", borderTopWidth: 1.5, borderTopColor: ACCENT, paddingVertical: 4 },
    totLabel:   { fontSize: 7.5, fontWeight: 700, color: DARK, paddingHorizontal: 4 },
    totAmt:     { fontSize: 7.5, fontWeight: 700, color: ACCENT, paddingHorizontal: 4, textAlign: "right" },
    totAmtG:    { fontSize: 7.5, fontWeight: 700, color: GREEN, paddingHorizontal: 4, textAlign: "right" },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer:     { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", fontSize: 6.5, color: "#9CA3AF", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 3 },
});

const c    = (v: any) => String(v ?? "").trim();
const fmtN = (v: any) => { const n = parseFloat(v); return isNaN(n) ? "—" : "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtD = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? c(v) : d.toLocaleDateString("en-US"); };
const flex = (w: number) => ({ flexGrow: w, flexBasis: 0 as const, flexShrink: 1 });

// LOGO_SRC: served from public/ at runtime — path.join(process.cwd(), 'public', 'fullpot-logo.png')
// @react-pdf/renderer accepts absolute file paths on the server
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
    const customer     = c(h.customer);
    const custCode     = c(h.code);
    const address1     = c(h.address1);
    const address2     = c(h.address2);
    const cityStateZip = [c(h.city), c(h.state), c(h.zip)].filter(Boolean).join(", ");
    const contact      = c(h.contact);
    const phone        = c(h.phone_1);
    const fax          = c(h.fax_1);

    // ── Balance & aging ──────────────────────────────────────────────────────
    // statement mode: aging buckets come from SP (same on all rows); balance = sum of buckets
    // balance mode: no aging buckets; balance = sum of individual row.balance
    const t0_30   = parseFloat(h.t0_30)   || 0;
    const t30_60  = parseFloat(h.t30_60)  || 0;
    const t60_90  = parseFloat(h.t60_90)  || 0;
    const t90_120 = parseFloat(h.t90_120) || 0;
    const t120    = parseFloat(h.t120)    || 0;
    const unapply = parseFloat(h.total_unapply) || 0;

    const totalDue = mode === "balance"
        ? rows.reduce((s, r) => s + (parseFloat(r.balance) || 0), 0)
        : t0_30 + t30_60 + t60_90 + t90_120 + t120;

    // ── Transaction rows ──────────────────────────────────────────────────────
    // statement: skip row 0 ("Last Balance") for transaction table totals
    const txRows     = mode === "statement" ? rows.slice(1) : rows;
    const totDebits  = txRows.reduce((s, r) => s + (parseFloat(r.debits)  || 0), 0);
    const totCredits = txRows.reduce((s, r) => s + (parseFloat(r.credits) || 0), 0);

    const dateLabel = fromDate && toDate
        ? `Period: ${fmtD(fromDate)} – ${fmtD(toDate)}`
        : `As of ${new Date().toLocaleDateString("en-US")}`;

    const showAging = mode === "statement";

    return (
        <Document title={`Statement — ${customer}`}>
            <Page size="LETTER" orientation="portrait" style={s.page}>

                {/* ── Header band ── */}
                <View style={s.headerBand} fixed>
                    <View style={s.logoWrap}>
                        {!!LOGO_SRC && <Image src={LOGO_SRC} style={s.logo} />}
                        <View style={s.coBlock}>
                            <Text style={s.coName}>{c(company.name) || "FULL POT OF FLOWERS"}</Text>
                            {company.address      && <Text style={s.coSub}>{company.address}</Text>}
                            {company.cityStateZip && <Text style={s.coSub}>{company.cityStateZip}</Text>}
                            {company.phone        && <Text style={s.coSub}>Tel: {company.phone}{company.fax ? `   Fax: ${company.fax}` : ""}</Text>}
                        </View>
                    </View>
                    <View style={s.titleBlock}>
                        <Text style={s.docTitle}>Account Statement</Text>
                        <Text style={s.docSub}>{dateLabel}</Text>
                        {mode === "balance" && <Text style={[s.docSub, { color: ACCENT, marginTop: 2 }]}>Open Invoices Only</Text>}
                    </View>
                </View>

                <View style={s.body}>

                    {/* ── Customer + balance cards ── */}
                    <View style={s.infoRow}>
                        <View style={[s.infoCard, s.infoAccent, { flex: 2 }]}>
                            <Text style={s.infoLabel}>Bill To</Text>
                            <Text style={s.infoValue}>{customer} — {custCode}</Text>
                            {address1     && <Text style={s.infoLine}>{address1}</Text>}
                            {address2     && <Text style={s.infoLine}>{address2}</Text>}
                            {cityStateZip && <Text style={s.infoLine}>{cityStateZip}</Text>}
                        </View>
                        <View style={s.infoCard}>
                            <Text style={s.infoLabel}>Contact</Text>
                            {contact && <Text style={s.infoValue}>{contact}</Text>}
                            {phone   && <Text style={s.infoLine}>P: {phone}</Text>}
                            {fax     && <Text style={s.infoLine}>F: {fax}</Text>}
                        </View>
                        <View style={[s.infoCard, s.infoAccent]}>
                            <Text style={s.infoLabel}>Balance Due</Text>
                            <Text style={[s.infoValue, { fontSize: 13, color: totalDue > 0 ? RED : GREEN }]}>{fmtN(totalDue)}</Text>
                            {unapply > 0 && <Text style={s.infoLine}>Unapplied: {fmtN(unapply)}</Text>}
                        </View>
                    </View>

                    {/* ── Aging strip (statement mode only) ── */}
                    {showAging && (
                        <View style={s.agingRow}>
                            {[
                                { label: "Current (0-30)", val: t0_30   },
                                { label: "31 - 60 Days",   val: t30_60  },
                                { label: "61 - 90 Days",   val: t60_90  },
                                { label: "91 - 120 Days",  val: t90_120 },
                                { label: "Over 120 Days",  val: t120    },
                                { label: "Total Due",      val: totalDue, hl: true },
                            ].map(({ label, val, hl }, i) => (
                                <View key={i} style={s.agingCell}>
                                    <Text style={s.agingLabel}>{label}</Text>
                                    <Text style={hl ? s.agingAmtHL : s.agingAmt}>{fmtN(val)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* ── Transaction table ── */}
                    <View style={s.thead} fixed>
                        <Text style={[s.th, flex(1.2)]}>Date</Text>
                        <Text style={[s.th, flex(2.5)]}>Type / Description</Text>
                        <Text style={[s.th, flex(1.5)]}>Document #</Text>
                        {mode === "statement" ? (
                            <>
                                <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Debits</Text>
                                <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Credits</Text>
                            </>
                        ) : null}
                        <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Balance</Text>
                    </View>

                    {rows.map((row, i) => {
                        const bal  = parseFloat(row.balance) || 0;
                        const deb  = parseFloat(row.debits)  || 0;
                        const cred = parseFloat(row.credits) || 0;
                        const inv  = row.invoice_no && String(row.invoice_no).trim() !== "0" ? String(row.invoice_no).trim() : "";
                        return (
                            <View key={i} style={i % 2 === 0 ? s.tr : s.trAlt} wrap={false}>
                                <Text style={[s.td,  flex(1.2)]}>{fmtD(row.date || row.fecha)}</Text>
                                <Text style={[s.td,  flex(2.5), { color: DARK, fontWeight: 700 }]}>{c(row.type)}</Text>
                                <Text style={[s.td,  flex(1.5), { color: BLUE }]}>{inv}</Text>
                                {mode === "statement" ? (
                                    <>
                                        <Text style={[s.tdR, flex(1.2), { color: deb  > 0 ? RED   : "#374151" }]}>{deb  > 0 ? fmtN(deb)  : ""}</Text>
                                        <Text style={[s.tdR, flex(1.2), { color: cred > 0 ? GREEN : "#374151" }]}>{cred > 0 ? fmtN(cred) : ""}</Text>
                                    </>
                                ) : null}
                                <Text style={[s.tdR, flex(1.2), { color: bal > 0 ? RED : "#374151", fontWeight: 700 }]}>{fmtN(bal)}</Text>
                            </View>
                        );
                    })}

                    {/* ── Totals ── */}
                    <View style={s.totRow}>
                        <Text style={[s.totLabel, flex(1.2 + 2.5 + 1.5)]}>
                            TOTAL ({rows.length} {mode === "balance" ? "open invoices" : "transactions"})
                        </Text>
                        {mode === "statement" ? (
                            <>
                                <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totDebits)}</Text>
                                <Text style={[s.totAmtG, flex(1.2)]}>{fmtN(totCredits)}</Text>
                            </>
                        ) : null}
                        <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totalDue)}</Text>
                    </View>

                </View>

                {/* ── Footer ── */}
                <View style={s.footer} fixed>
                    <Text>Generated {new Date().toLocaleString("en-US")} — {c(company.name)}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>

            </Page>
        </Document>
    );
}
