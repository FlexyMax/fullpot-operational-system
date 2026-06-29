import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmt2 = (v: any) => { const n = parseFloat(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

// "Stock OM" (Lines panel GridMenu) — VFP btn_stock tooltip "Print stock
// open market". sp_flower_packing_stock_without_customer_report, verified
// live (no params, ws_packing_stock_without_customer.frx).
//
// The proc has no filter at all and returns 13.5k+ rows in production (stock
// dating back to 2010 that never got written off) — react-pdf renders this
// app's tables at ~50ms/row (Yoga layout per cell), so the unfiltered report
// takes 10+ minutes and is unusable. Capped to the freshest MAX_ROWS records
// (by `days`, the same recency field already shown on screen) so the report
// stays useful (the stock someone could actually still sell) and finishes in
// single-digit seconds; the subtitle says so explicitly rather than silently
// dropping rows.
const MAX_ROWS = 300;

const COLUMNS: ReportColumn[] = [
    { key: "vendor",      label: "Vendor",  width: 1.3 },
    { key: "awbcode",     label: "AWB",     width: 0.9 },
    { key: "lote",        label: "Lot",     width: 0.7 },
    { key: "days",        label: "Days",    width: 0.5, align: "right", render: r => fmtI(r.days) },
    { key: "description", label: "Product", width: 2 },
    { key: "stock",       label: "Stock",   width: 0.7, align: "right", render: r => fmtI(r.stock) },
    { key: "price_x_unit", label: "U.Price", width: 0.7, align: "right", render: r => fmt2(r.price_x_unit) },
    { key: "boxvalue",    label: "BoxValue", width: 0.8, align: "right", render: r => fmt2(r.boxvalue) },
    { key: "stockvalue",  label: "T.Value", width: 0.9, align: "right", render: r => fmt2(r.stockvalue) },
];

export async function GET() {
    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_stock_without_customer_report", {}),
        getCompanyInfo(),
    ]);

    const all = r.recordset ?? [];
    const rows = [...all]
        .sort((a, b) => parseInt(a.days ?? 0, 10) - parseInt(b.days ?? 0, 10))
        .slice(0, MAX_ROWS);
    const title = t(all[0]?.tituloreporte) || "Stock Without Customer";
    const subtitle = all.length > MAX_ROWS
        ? `Freshest ${MAX_ROWS} of ${all.length.toLocaleString("en-US")} records (sorted by Days in stock)`
        : undefined;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "warehouse",
                label: row => t(row.warehouse),
                totals: ["stockvalue"],
                totalLabel: row => `TOTAL: ${t(row.warehouse)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="stock_without_customer.pdf"`,
        },
    });
}
