import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { CompanyInfo } from "@/lib/reports/companyInfo";

// Default hyphenation breaks long words mid-syllable (e.g. "EX-TRA") to fit a
// narrow column — wrap at spaces only instead, never split inside a word.
Font.registerHyphenationCallback(word => [word]);

const ACCENT = "#FB7506";
const DARK = "#4F4F4F";
const BORDER = "#DBD9D9";

const styles = StyleSheet.create({
    page: { padding: 24, fontSize: 8, fontFamily: "Helvetica", color: "#333" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" },
    companyName: { fontSize: 14, fontWeight: 700, color: ACCENT },
    companyLine: { fontSize: 7, color: "#666", marginTop: 1 },
    titleBlock: { alignItems: "flex-end" },
    reportTitle: { fontSize: 11, fontWeight: 700, color: DARK },
    subtitle: { fontSize: 8, color: "#666", marginTop: 2 },
    divider: { borderBottomWidth: 2, borderBottomColor: ACCENT, marginBottom: 8 },
    table: { width: "100%" },
    theadRow: { flexDirection: "row", backgroundColor: DARK, paddingVertical: 4 },
    th: { color: "#fff", fontSize: 7, fontWeight: 700, textTransform: "uppercase", paddingHorizontal: 3 },
    groupRow: { flexDirection: "row", backgroundColor: "#FBF9F8", borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 3, marginTop: 4 },
    groupLabel: { fontSize: 8, fontWeight: 700, color: ACCENT, paddingHorizontal: 3 },
    tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3 },
    td: { fontSize: 7.5, paddingHorizontal: 3 },
    subtotalRow: { flexDirection: "row", backgroundColor: "#F5F3F3", borderTopWidth: 1, borderTopColor: BORDER, borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 3 },
    subtotalLabel: { fontSize: 7.5, fontWeight: 700, color: DARK, paddingHorizontal: 3 },
    footer: { position: "absolute", bottom: 16, left: 24, right: 24, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: "#999", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 4 },
});

export interface ReportColumn {
    key: string;
    label: string;
    width: number; // flex-grow weight, relative
    align?: "left" | "right" | "center";
    render?: (row: any) => string;
}

export interface ReportGroup {
    key: string;
    label: (row: any) => string;
    totals?: string[]; // numeric column keys to sum in the subtotal row
    totalLabel?: (row: any) => string;
}

interface Props {
    company: CompanyInfo;
    title: string;
    subtitle?: string;
    columns: ReportColumn[];
    rows: any[];
    group?: ReportGroup;
    landscape?: boolean;
}

const fmt = (v: any) => {
    const n = parseFloat(v);
    if (isNaN(n)) return String(v ?? "");
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// SQL Server CHAR columns come back space-padded to their fixed width (seen
// directly on flower_definitions.d_company, etc.) — left untrimmed, that
// padding reads as one long unbreakable "word" to the text layout engine,
// which then force-wraps/hyphenates it for no visible reason.
const cell = (v: any) => String(v ?? "").trim();

// flexGrow alone sizes a cell off its own content first and only then grows it —
// that makes columns drift out of alignment between the header row and rows with
// different content lengths. flexBasis: 0 forces every cell in a column to the
// same proportional width regardless of what text it holds.
const colFlex = (width: number) => ({ flexGrow: width, flexBasis: 0 as const, flexShrink: 1 });

function Row({ row, columns }: { row: any; columns: ReportColumn[] }) {
    return (
        <View style={styles.tr}>
            {columns.map(c => (
                <Text key={c.key} style={[styles.td, colFlex(c.width), { textAlign: c.align ?? "left" }]}>
                    {c.render ? c.render(row) : cell(row[c.key])}
                </Text>
            ))}
        </View>
    );
}

export function ReportPDF({ company, title, subtitle, columns, rows, group, landscape = true }: Props) {
    const groups: { key: string; label: string; rows: any[] }[] = [];
    if (group) {
        for (const row of rows) {
            const key = String(row[group.key] ?? "");
            let g = groups.find(g => g.key === key);
            if (!g) { g = { key, label: group.label(row), rows: [] }; groups.push(g); }
            g.rows.push(row);
        }
    }

    return (
        <Document>
            <Page size="LETTER" orientation={landscape ? "landscape" : "portrait"} style={styles.page}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.companyName}>{company.name}</Text>
                        {company.address && <Text style={styles.companyLine}>{company.address}</Text>}
                        {company.cityStateZip && <Text style={styles.companyLine}>{company.cityStateZip}</Text>}
                        {(company.phone || company.fax) && (
                            <Text style={styles.companyLine}>
                                {company.phone && `Phone: ${company.phone}`}{company.phone && company.fax ? "  " : ""}{company.fax && `Fax: ${company.fax}`}
                            </Text>
                        )}
                    </View>
                    <View style={styles.titleBlock}>
                        <Text style={styles.reportTitle}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.table}>
                    <View style={styles.theadRow}>
                        {columns.map(c => (
                            <Text key={c.key} style={[styles.th, colFlex(c.width), { textAlign: c.align ?? "left" }]}>{c.label}</Text>
                        ))}
                    </View>

                    {group ? groups.map(g => (
                        <View key={g.key}>
                            <View style={styles.groupRow}>
                                <Text style={styles.groupLabel}>{g.label}</Text>
                            </View>
                            {g.rows.map((row, i) => <Row key={i} row={row} columns={columns} />)}
                            {group.totals && (
                                <View style={styles.subtotalRow}>
                                    {columns.map((c, ci) => {
                                        if (ci === 0) {
                                            return <Text key={c.key} style={[styles.subtotalLabel, colFlex(c.width)]}>{group.totalLabel ? group.totalLabel(g.rows[0]) : "TOTAL"}</Text>;
                                        }
                                        if (group.totals!.includes(c.key)) {
                                            const sum = g.rows.reduce((acc, r) => acc + (parseFloat(r[c.key]) || 0), 0);
                                            return <Text key={c.key} style={[styles.subtotalLabel, colFlex(c.width), { textAlign: c.align ?? "left" }]}>{fmt(sum)}</Text>;
                                        }
                                        return <Text key={c.key} style={[styles.subtotalLabel, colFlex(c.width)]} />;
                                    })}
                                </View>
                            )}
                        </View>
                    )) : rows.map((row, i) => <Row key={i} row={row} columns={columns} />)}

                    {rows.length === 0 && (
                        <View style={styles.tr}>
                            <Text style={[styles.td, { flexGrow: 1, textAlign: "center", color: "#999", fontStyle: "italic" }]}>No data found.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer} fixed>
                    <Text>Generated {new Date().toLocaleString("en-US")}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
