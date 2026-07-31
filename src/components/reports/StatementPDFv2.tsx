import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import path from "path";
import type { CompanyInfo } from "@/lib/reports/companyInfo";

const LOGO = path.join(process.cwd(), "public", "fullpot-logo.png");

const ACCENT = "#FB7506";
const DARK   = "#1E2633";
const GRAY   = "#6B7280";
const LGRAY  = "#E5E7EB";
const BG     = "#F9FAFB";
const RED    = "#DC2626";
const GREEN  = "#059669";
const BLUE   = "#1D4ED8";
const OLIGHT = "#FFF7ED";

const s = StyleSheet.create({
    page:     { paddingBottom: 44, fontSize: 8, fontFamily: "Helvetica", color: "#1F2937", backgroundColor: "#FFFFFF" },
    header:   { backgroundColor: "#FFFFFF", paddingHorizontal: 28, paddingTop: 14, paddingBottom: 10,
                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                borderBottomWidth: 3, borderBottomColor: ACCENT, marginBottom: 12 },
    logoRow:  { flexDirection: "row", alignItems: "center" },
    logo:     { width: 60, height: 60 },
    coWrap:   { marginLeft: 10 },
    coName:   { fontSize: 14, fontWeight: 700, color: DARK },
    coLine:   { fontSize: 6.5, color: GRAY, marginTop: 2 },
    hRight:   { alignItems: "flex-end" },
    docTitle: { fontSize: 13, fontWeight: 700, color: DARK, textTransform: "uppercase" },
    docBar:   { width: 56, height: 2, backgroundColor: ACCENT, marginTop: 3, alignSelf: "flex-end" },
    docSub:   { fontSize: 7, color: GRAY, marginTop: 4 },
    badge:    { marginTop: 4, backgroundColor: OLIGHT, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2,
                borderWidth: 1, borderColor: ACCENT },
    badgeTx:  { fontSize: 7, fontWeight: 700, color: ACCENT },

    body:     { paddingHorizontal: 28 },

    cards:    { flexDirection: "row", marginBottom: 10 },
    card:     { flex: 1, borderRadius: 3, padding: 7, borderWidth: 1, borderColor: LGRAY, backgroundColor: BG, marginRight: 8 },
    cardL:    { flex: 1, borderRadius: 3, padding: 7, borderWidth: 1, borderColor: LGRAY, backgroundColor: BG },
    cardAcc:  { borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 7 },
    cLabel:   { fontSize: 6, fontWeight: 700, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
    cValue:   { fontSize: 8.5, fontWeight: 700, color: DARK },
    cLine:    { fontSize: 7, color: GRAY, marginTop: 1 },

    strip:    { flexDirection: "row", backgroundColor: DARK, borderRadius: 4, marginBottom: 10, minHeight: 40 },
    scell:    { flex: 1, paddingVertical: 8, paddingHorizontal: 4, alignItems: "center", justifyContent: "center",
                borderRightWidth: 1, borderRightColor: "#374151" },
    scellE:   { flex: 1, paddingVertical: 8, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" },
    slabel:   { fontSize: 5.5, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 3, textAlign: "center" },
    samt:     { fontSize: 9, fontWeight: 700, color: "#FFFFFF" },
    samtHL:   { fontSize: 9, fontWeight: 700, color: ACCENT },

    notes:    { marginBottom: 10, padding: 7, backgroundColor: OLIGHT, borderRadius: 3, borderLeftWidth: 3, borderLeftColor: ACCENT },
    notesTx:  { fontSize: 7, color: "#374151" },

    thead:    { flexDirection: "row", backgroundColor: DARK, paddingVertical: 5, marginBottom: 0 },
    th:       { fontSize: 6.5, fontWeight: 700, color: "#D1D5DB", textTransform: "uppercase", paddingHorizontal: 4 },
    tr:       { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LGRAY, paddingVertical: 3.5 },
    trAlt:    { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LGRAY, paddingVertical: 3.5, backgroundColor: BG },
    td:       { fontSize: 7.5, paddingHorizontal: 4, color: "#374151" },
    tdR:      { fontSize: 7.5, paddingHorizontal: 4, textAlign: "right" },

    totRow:   { flexDirection: "row", backgroundColor: OLIGHT, borderTopWidth: 2, borderTopColor: ACCENT, paddingVertical: 4 },
    totLbl:   { fontSize: 7.5, fontWeight: 700, color: DARK, paddingHorizontal: 4 },
    totAmt:   { fontSize: 7.5, fontWeight: 700, color: ACCENT, paddingHorizontal: 4, textAlign: "right" },
    totAmtG:  { fontSize: 7.5, fontWeight: 700, color: GREEN,  paddingHorizontal: 4, textAlign: "right" },

    footer:   { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row",
                justifyContent: "space-between", fontSize: 6.5, color: "#9CA3AF",
                borderTopWidth: 1, borderTopColor: LGRAY, paddingTop: 3 },
});

const fmt = (v: any) => {
    const n = parseFloat(v);
    if (isNaN(n)) return "—";
    return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtD = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v ?? "") : d.toLocaleDateString("en-US");
};
const str  = (v: any) => String(v ?? "").trim();
const flx  = (w: number) => ({ flexGrow: w, flexBasis: 0 as const, flexShrink: 1 });

interface Props {
    company:   CompanyInfo;
    rows:      any[];
    fromDate?: string;
    toDate?:   string;
    mode?:     "statement" | "balance";
}

export function StatementPDFv2({ company, rows, fromDate, toDate, mode = "statement" }: Props) {
    if (!rows.length) return (
        <Document><Page size="LETTER" style={s.page}><View style={s.body}><Text>No data.</Text></View></Page></Document>
    );

    const h = rows[0];

    const customer    = str(h.customer);
    const custCode    = str(h.code || h.old_code);
    const addr1       = str(h.address1);
    const addr2       = str(h.address2);
    const cszLine     = [str(h.city), str(h.state), str(h.zip)].filter(Boolean).join(", ");
    const contact     = str(h.contact);
    const phone       = str(h.phone_1);
    const fax         = str(h.fax_1);
    const terms       = str(h.terms);
    const notes       = str(h.statement_notes);
    const unapply     = parseFloat(h.total_unapply) || 0;

    const t0   = parseFloat(h.t0_30)   || 0;
    const t30  = parseFloat(h.t30_60)  || 0;
    const t60  = parseFloat(h.t60_90)  || 0;
    const t90  = parseFloat(h.t90_120) || 0;
    const t120 = parseFloat(h.t120)    || 0;
    const total = t0 + t30 + t60 + t90 + t120;

    const m1    = str(h.month_1)    || "Current";
    const m2    = str(h.month_2)    || "Prior";
    const m3    = str(h.month_3)    || "2 Mo";
    const m4    = str(h.month_4)    || "3 Mo";
    const m4p   = str(h.month_4plus)|| "Older";

    const txRows     = mode === "statement" ? rows.slice(1) : rows;
    const totDebits  = txRows.reduce((s, r) => s + (parseFloat(r.debits)  || 0), 0);
    const totCredits = txRows.reduce((s, r) => s + (parseFloat(r.credits) || 0), 0);

    const dateLabel = fromDate && toDate
        ? `Period: ${fmtD(fromDate)} – ${fmtD(toDate)}`
        : `As of ${new Date().toLocaleDateString("en-US")}`;

    return (
        <Document title={`Statement — ${customer}`}>
            <Page size="LETTER" style={s.page}>

                {/* WHITE HEADER */}
                <View style={s.header}>
                    <View style={s.logoRow}>
                        <Image src={LOGO} style={s.logo} />
                        <View style={s.coWrap}>
                            <Text style={s.coName}>{str(company.name) || "FULL POT OF FLOWERS"}</Text>
                            {company.address      && <Text style={s.coLine}>{company.address}</Text>}
                            {company.cityStateZip && <Text style={s.coLine}>{company.cityStateZip}</Text>}
                            {company.phone        && <Text style={s.coLine}>Tel: {company.phone}{company.fax ? `   Fax: ${company.fax}` : ""}</Text>}
                        </View>
                    </View>
                    <View style={s.hRight}>
                        <Text style={s.docTitle}>Account Statement</Text>
                        <View style={s.docBar} />
                        <Text style={s.docSub}>{dateLabel}</Text>
                        {mode === "balance" && <View style={s.badge}><Text style={s.badgeTx}>Open Invoices Only</Text></View>}
                    </View>
                </View>

                <View style={s.body}>

                    {/* CUSTOMER CARDS */}
                    <View style={s.cards}>
                        <View style={[s.card, s.cardAcc, { flex: 2 }]}>
                            <Text style={s.cLabel}>Bill To</Text>
                            <Text style={s.cValue}>{customer}{custCode ? ` — ${custCode}` : ""}</Text>
                            {addr1   && <Text style={s.cLine}>{addr1}</Text>}
                            {addr2   && <Text style={s.cLine}>{addr2}</Text>}
                            {cszLine && <Text style={s.cLine}>{cszLine}</Text>}
                            {terms   && <Text style={[s.cLine, { marginTop: 4, fontWeight: 700 }]}>Terms: {terms}</Text>}
                        </View>
                        <View style={s.card}>
                            <Text style={s.cLabel}>Contact</Text>
                            {contact && <Text style={s.cValue}>{contact}</Text>}
                            {phone   && <Text style={s.cLine}>P: {phone}</Text>}
                            {fax     && <Text style={s.cLine}>F: {fax}</Text>}
                        </View>
                        <View style={[s.cardL, s.cardAcc]}>
                            <Text style={s.cLabel}>Balance Due</Text>
                            <Text style={[s.cValue, { fontSize: 14, color: total > 0 ? RED : GREEN }]}>{fmt(total)}</Text>
                            {unapply < 0 && <Text style={[s.cLine, { color: GREEN }]}>Credit: {fmt(unapply)}</Text>}
                        </View>
                    </View>

                    {/* AGING STRIP — statement mode */}
                    {mode === "statement" && (
                        <View style={s.strip}>
                            <View style={s.scell}><Text style={s.slabel}>{"Current\n0 – 30 Days"}</Text><Text style={s.samt}>{fmt(t0)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>31 – 60 Days</Text><Text style={s.samt}>{fmt(t30)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>61 – 90 Days</Text><Text style={s.samt}>{fmt(t60)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>91 – 120 Days</Text><Text style={s.samt}>{fmt(t90)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>Over 120 Days</Text><Text style={s.samt}>{fmt(t120)}</Text></View>
                            <View style={s.scellE}><Text style={s.slabel}>Total Balance Due</Text><Text style={s.samtHL}>{fmt(total)}</Text></View>
                        </View>
                    )}

                    {/* MONTHLY STRIP — balance mode */}
                    {mode === "balance" && (
                        <View style={s.strip}>
                            <View style={s.scell}><Text style={s.slabel}>{m1}</Text><Text style={s.samt}>{fmt(t0)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>{m2}</Text><Text style={s.samt}>{fmt(t30)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>{m3}</Text><Text style={s.samt}>{fmt(t60)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>{m4}</Text><Text style={s.samt}>{fmt(t90)}</Text></View>
                            <View style={s.scell}><Text style={s.slabel}>{m4p}</Text><Text style={s.samt}>{fmt(t120)}</Text></View>
                            <View style={s.scellE}><Text style={s.slabel}>Total Balance Due</Text><Text style={s.samtHL}>{fmt(total)}</Text></View>
                        </View>
                    )}

                    {/* NOTES */}
                    {!!notes && <View style={s.notes}><Text style={s.notesTx}>{notes}</Text></View>}

                    {/* TABLE HEADER */}
                    <View style={s.thead}>
                        <Text style={[s.th, flx(1.2)]}>Date</Text>
                        <Text style={[s.th, flx(2.5)]}>Type / Description</Text>
                        <Text style={[s.th, flx(1.5)]}>Document #</Text>
                        {mode === "balance"   && <Text style={[s.th, flx(1.5)]}>Due Date</Text>}
                        {mode === "statement" && <Text style={[s.th, flx(1.2), { textAlign: "right" }]}>Debits</Text>}
                        {mode === "statement" && <Text style={[s.th, flx(1.2), { textAlign: "right" }]}>Credits</Text>}
                        <Text style={[s.th, flx(1.2), { textAlign: "right" }]}>Balance</Text>
                    </View>

                    {/* ROWS */}
                    {rows.map((row, i) => {
                        const bal  = parseFloat(row.balance) || 0;
                        const deb  = parseFloat(row.debits)  || 0;
                        const cred = parseFloat(row.credits) || 0;
                        const inv  = row.invoice_no && String(row.invoice_no).trim() !== "0" ? String(row.invoice_no).trim() : "";
                        return (
                            <View key={i} style={i % 2 === 0 ? s.tr : s.trAlt} wrap={false}>
                                <Text style={[s.td,  flx(1.2)]}>{fmtD(row.date || row.fecha)}</Text>
                                <Text style={[s.td,  flx(2.5), { fontWeight: 700 }]}>{str(row.type)}</Text>
                                <Text style={[s.td,  flx(1.5), { color: BLUE }]}>{inv}</Text>
                                {mode === "balance"   && <Text style={[s.td,  flx(1.5), { color: GRAY }]}>{str(row.due_date)}</Text>}
                                {mode === "statement" && <Text style={[s.tdR, flx(1.2), { color: deb  > 0 ? RED   : "#374151" }]}>{deb  > 0 ? fmt(deb)  : ""}</Text>}
                                {mode === "statement" && <Text style={[s.tdR, flx(1.2), { color: cred > 0 ? GREEN : "#374151" }]}>{cred > 0 ? fmt(cred) : ""}</Text>}
                                <Text style={[s.tdR, flx(1.2), { color: bal > 0 ? RED : "#374151", fontWeight: 700 }]}>{fmt(bal)}</Text>
                            </View>
                        );
                    })}

                    {/* TOTALS */}
                    <View style={s.totRow}>
                        <Text style={[s.totLbl, flx(1.2 + 2.5 + 1.5 + (mode === "balance" ? 1.5 : 0))]}>
                            TOTAL — {rows.length} {mode === "balance" ? "open invoices" : "transactions"}
                        </Text>
                        {mode === "statement" && <Text style={[s.totAmt,  flx(1.2)]}>{fmt(totDebits)}</Text>}
                        {mode === "statement" && <Text style={[s.totAmtG, flx(1.2)]}>{fmt(totCredits)}</Text>}
                        <Text style={[s.totAmt, flx(1.2)]}>{fmt(total)}</Text>
                    </View>

                </View>

                {/* FOOTER */}
                <View style={s.footer} fixed>
                    <Text>Generated {new Date().toLocaleString("en-US")} — {str(company.name)}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>

            </Page>
        </Document>
    );
}
