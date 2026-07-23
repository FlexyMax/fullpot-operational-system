import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { CompanyInfo } from "@/lib/reports/companyInfo";

Font.registerHyphenationCallback(word => [word]);

const ACCENT = "#FB7506";
const DARK   = "#2F3542";
const BORDER = "#DBD9D9";
const GRAY   = "#6B7280";

const s = StyleSheet.create({
    page:       { padding: 28, fontSize: 8, fontFamily: "Helvetica", color: "#222", backgroundColor: "#FFF" },
    // ── Top header ──────────────────────────────────────────────────────────────
    topRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
    coName:     { fontSize: 13, fontWeight: 700, color: ACCENT },
    coLine:     { fontSize: 7, color: GRAY, marginTop: 1 },
    titleBlock: { alignItems: "flex-end" },
    docTitle:   { fontSize: 14, fontWeight: 700, color: DARK, textTransform: "uppercase" },
    docNum:     { fontSize: 10, fontWeight: 700, color: ACCENT, marginTop: 2 },
    divider:    { borderBottomWidth: 2, borderBottomColor: ACCENT, marginBottom: 8 },
    // ── Info grid ───────────────────────────────────────────────────────────────
    infoBox:    { flexDirection: "row", gap: 8, marginBottom: 10 },
    infoCard:   { flex: 1, backgroundColor: "#F8F6F4", borderRadius: 3, padding: 6, borderLeftWidth: 2.5, borderLeftColor: ACCENT },
    infoLabel:  { fontSize: 6.5, fontWeight: 700, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
    infoValue:  { fontSize: 8.5, fontWeight: 700, color: DARK },
    infoSub:    { fontSize: 7, color: GRAY, marginTop: 1 },
    // ── Status badge ────────────────────────────────────────────────────────────
    statusPaid:    { backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, fontSize: 8, fontWeight: 700 },
    statusPending: { backgroundColor: "#FEF3C7", color: "#92400E", borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, fontSize: 8, fontWeight: 700 },
    // ── Invoice table ───────────────────────────────────────────────────────────
    tableTitle: { fontSize: 8, fontWeight: 700, color: DARK, textTransform: "uppercase", marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingBottom: 2 },
    thead:      { flexDirection: "row", backgroundColor: DARK, paddingVertical: 4 },
    th:         { color: "#FFF", fontSize: 7, fontWeight: 700, textTransform: "uppercase", paddingHorizontal: 3 },
    tr:         { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3 },
    trAlt:      { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3, backgroundColor: "#FAFAFA" },
    td:         { fontSize: 7.5, paddingHorizontal: 3, color: "#333" },
    tdAmt:      { fontSize: 7.5, paddingHorizontal: 3, color: "#333", textAlign: "right" },
    // ── Totals ──────────────────────────────────────────────────────────────────
    totRow:     { flexDirection: "row", backgroundColor: "#F1F0EE", borderTopWidth: 1.5, borderTopColor: ACCENT, paddingVertical: 4, marginTop: 1 },
    totLabel:   { fontSize: 7.5, fontWeight: 700, color: DARK, paddingHorizontal: 3 },
    totAmt:     { fontSize: 7.5, fontWeight: 700, color: ACCENT, paddingHorizontal: 3, textAlign: "right" },
    // ── Notes ───────────────────────────────────────────────────────────────────
    notesBox:   { marginTop: 10, padding: 6, backgroundColor: "#F8F6F4", borderRadius: 3 },
    notesLabel: { fontSize: 6.5, fontWeight: 700, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
    notesText:  { fontSize: 7.5, color: "#444" },
    // ── Footer ──────────────────────────────────────────────────────────────────
    footer:     { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", fontSize: 6.5, color: "#AAA", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 3 },
});

const c    = (v: any) => String(v ?? "").trim();
const fmtN = (v: any) => { const n = parseFloat(v); return isNaN(n) ? "" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtD = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : c(v); };
const flex = (w: number) => ({ flexGrow: w, flexBasis: 0 as const, flexShrink: 1 });

interface Props {
    company: CompanyInfo;
    rows: any[];          // rows from sp_flower_growers_payments_report (lowercase keys)
    outcomeUq: string;
}

export function PaymentAuthPDF({ company, rows, outcomeUq }: Props) {
    const first = rows[0] ?? {};

    const vendor    = c(first.grower);
    const farm      = c(first.farm);
    const bank      = c(first.bank);
    const docNo     = c(first.out_document);
    const docDate   = fmtD(first.out_date);
    const total     = fmtN(first.total_payment);
    const status    = c(first.status).toUpperCase();
    const docType   = c(first.doc_type);
    const notes     = c(first.out_details);
    const isPaid    = status.includes("CLOSE") || status.includes("PAID");

    const totInv = rows.reduce((s, r) => s + (parseFloat(r.line_value)   || 0), 0);
    const totPay = rows.reduce((s, r) => s + (parseFloat(r.payment)       || 0), 0);
    const totCre = rows.reduce((s, r) => s + (parseFloat(r.line_credits)  || 0), 0);
    const totDeb = rows.reduce((s, r) => s + (parseFloat(r.line_debits)   || 0), 0);
    const totBal = rows.reduce((s, r) => s + (parseFloat(r.line_balance)  || 0), 0);

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={s.page}>

                {/* ── Company + Title ── */}
                <View fixed>
                    <View style={s.topRow}>
                        <View>
                            <Text style={s.coName}>{c(company.name)}</Text>
                            {company.address      && <Text style={s.coLine}>{company.address}</Text>}
                            {company.cityStateZip && <Text style={s.coLine}>{company.cityStateZip}</Text>}
                            {company.phone        && <Text style={s.coLine}>Tel: {company.phone}</Text>}
                        </View>
                        <View style={s.titleBlock}>
                            <Text style={s.docTitle}>Payment Authorization</Text>
                            <Text style={s.docNum}>#{docNo || outcomeUq}</Text>
                        </View>
                    </View>
                    <View style={s.divider} />
                </View>

                {/* ── Info cards ── */}
                <View style={s.infoBox}>
                    <View style={[s.infoCard, { flex: 2 }]}>
                        <Text style={s.infoLabel}>Vendor</Text>
                        <Text style={s.infoValue}>{vendor || "—"}</Text>
                        {!!farm && <Text style={s.infoSub}>Farm: {farm}</Text>}
                    </View>
                    <View style={s.infoCard}>
                        <Text style={s.infoLabel}>Bank</Text>
                        <Text style={s.infoValue}>{bank || "—"}</Text>
                        {!!docType && <Text style={s.infoSub}>{docType}</Text>}
                    </View>
                    <View style={s.infoCard}>
                        <Text style={s.infoLabel}>Date</Text>
                        <Text style={s.infoValue}>{docDate || "—"}</Text>
                    </View>
                    <View style={s.infoCard}>
                        <Text style={s.infoLabel}>Total Amount</Text>
                        <Text style={[s.infoValue, { color: ACCENT }]}>${total || "0.00"}</Text>
                        <View style={{ marginTop: 3 }}>
                            <Text style={isPaid ? s.statusPaid : s.statusPending}>{status || "PENDING"}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Invoice table ── */}
                <Text style={s.tableTitle}>Applied Invoices ({rows.length})</Text>
                <View style={s.thead} fixed>
                    <Text style={[s.th, flex(2.5)]}>Invoice #</Text>
                    <Text style={[s.th, flex(1.5)]}>PO</Text>
                    <Text style={[s.th, flex(1.5)]}>Inv. Date</Text>
                    <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Inv. Amount</Text>
                    <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Payment</Text>
                    <Text style={[s.th, flex(1), { textAlign: "right" }]}>Credits</Text>
                    <Text style={[s.th, flex(1), { textAlign: "right" }]}>Debits</Text>
                    <Text style={[s.th, flex(1.2), { textAlign: "right" }]}>Balance</Text>
                </View>

                {rows.length === 0 ? (
                    <View style={s.tr}>
                        <Text style={[s.td, { flexGrow: 1, textAlign: "center", color: "#999", fontStyle: "italic" }]}>No invoices linked.</Text>
                    </View>
                ) : rows.map((row, i) => {
                    const bal = parseFloat(row.line_balance) || 0;
                    return (
                        <View key={i} style={i % 2 === 0 ? s.tr : s.trAlt}>
                            <Text style={[s.td, flex(2.5), { color: ACCENT, fontWeight: 700 }]}>{c(row.invoice_no)}</Text>
                            <Text style={[s.td, flex(1.5)]}>{row.porder_no && String(row.porder_no) !== "0" ? String(row.porder_no) : ""}</Text>
                            <Text style={[s.td, flex(1.5)]}>{fmtD(row.invoice_date)}</Text>
                            <Text style={[s.tdAmt, flex(1.2)]}>{fmtN(row.line_value)}</Text>
                            <Text style={[s.tdAmt, flex(1.2), { color: "#1D4ED8" }]}>{fmtN(row.payment)}</Text>
                            <Text style={[s.tdAmt, flex(1), { color: "#059669" }]}>{fmtN(row.line_credits)}</Text>
                            <Text style={[s.tdAmt, flex(1), { color: "#DC2626" }]}>{fmtN(row.line_debits)}</Text>
                            <Text style={[s.tdAmt, flex(1.2), { color: bal > 0 ? "#D97706" : "#059669", fontWeight: 700 }]}>{fmtN(row.line_balance)}</Text>
                        </View>
                    );
                })}

                {/* ── Totals ── */}
                {rows.length > 0 && (
                    <View style={s.totRow}>
                        <Text style={[s.totLabel, flex(2.5 + 1.5 + 1.5)]}>TOTALS ({rows.length} invoices)</Text>
                        <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totInv)}</Text>
                        <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totPay)}</Text>
                        <Text style={[s.totAmt, flex(1)]}>{fmtN(totCre)}</Text>
                        <Text style={[s.totAmt, flex(1)]}>{fmtN(totDeb)}</Text>
                        <Text style={[s.totAmt, flex(1.2)]}>{fmtN(totBal)}</Text>
                    </View>
                )}

                {/* ── Notes ── */}
                {!!notes && (
                    <View style={s.notesBox}>
                        <Text style={s.notesLabel}>Notes / Details</Text>
                        <Text style={s.notesText}>{notes}</Text>
                    </View>
                )}

                {/* ── Signature line ── */}
                <View style={{ marginTop: 30, flexDirection: "row", gap: 20 }}>
                    {["Authorized By", "Approved By"].map(lbl => (
                        <View key={lbl} style={{ flex: 1 }}>
                            <View style={{ borderBottomWidth: 0.75, borderBottomColor: DARK, marginBottom: 3 }} />
                            <Text style={{ fontSize: 7, color: GRAY, textAlign: "center" }}>{lbl}</Text>
                        </View>
                    ))}
                    <View style={{ flex: 1 }}>
                        <View style={{ borderBottomWidth: 0.75, borderBottomColor: DARK, marginBottom: 3 }} />
                        <Text style={{ fontSize: 7, color: GRAY, textAlign: "center" }}>Date</Text>
                    </View>
                </View>

                <View style={s.footer} fixed>
                    <Text>Generated {new Date().toLocaleString("en-US")}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>

            </Page>
        </Document>
    );
}
