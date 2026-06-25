import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

Font.registerHyphenationCallback(word => [word]);

const ACCENT = "#FB7506";
const BORDER = "#999";

const styles = StyleSheet.create({
    page: { padding: 16, fontSize: 8, fontFamily: "Helvetica", color: "#222" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    card: {
        width: "33.33%", height: 132, padding: 6, borderWidth: 0.75, borderColor: BORDER,
        flexDirection: "column", justifyContent: "space-between",
    },
    farm: { fontSize: 13, fontWeight: 700, color: ACCENT },
    cycle: { fontSize: 11, fontWeight: 700 },
    desc: { fontSize: 8, marginTop: 2 },
    row: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
    small: { fontSize: 7, color: "#555" },
    barcode: { fontSize: 10, fontFamily: "Courier", letterSpacing: 1, marginTop: 4 },
});

const t = (v: any) => String(v ?? "").trim();

export function LabelGridPDF({ rows }: { rows: any[] }) {
    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                <View style={styles.grid}>
                    {rows.map((row, i) => (
                        <View key={i} style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.farm}>{t(row.farm)}</Text>
                                <Text style={styles.cycle}>{t(row.caja_no_de)}</Text>
                            </View>
                            <Text style={styles.desc}>{t(row.description)}</Text>
                            <View style={styles.row}>
                                <Text style={styles.small}>Lote: {t(row.lote)}</Text>
                                <Text style={styles.small}>{t(row.case_sh)}</Text>
                                <Text style={styles.small}>{t(row.tunits_x_box)} u</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.small}>AWB: {t(row.awbcode)}</Text>
                                <Text style={styles.small}>Cust: {t(row.customer)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.small}>{t(row.market)} {t(row.pbook_no)}</Text>
                                {t(row.box_id) && <Text style={styles.small}>{t(row.box_id)}</Text>}
                            </View>
                            <Text style={styles.barcode}>*{t(row.barcode_superior)}*</Text>
                        </View>
                    ))}
                    {rows.length === 0 && (
                        <Text style={{ padding: 16, color: "#999", fontStyle: "italic" }}>No labels found.</Text>
                    )}
                </View>
            </Page>
        </Document>
    );
}
