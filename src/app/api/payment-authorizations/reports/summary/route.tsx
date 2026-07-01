import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn, type VendorInfo } from "@/components/reports/ReportPDF";

// AP Summary Report — VFP: ws_growers_pending_accounts_last_quarter.frx
// SP: sp_flower_growers_pending_invoices_report2
// Params: lcgrower_uq, ldfrom, ldto, lnoption

const t           = (v: any) => String(v ?? "").trim();
const fmt         = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate     = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };
const fmtDateTime = (v: any): string => { const d = v instanceof Date ? v : (v ? new Date(v) : null); if (!d || isNaN(d.getTime())) return String(v ?? "").trim(); const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0; if (hasTime) { const dt = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); const tm = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" }); return `${dt} ${tm}`; } return d.toLocaleDateString("en-US", { timeZone: "America/New_York" }); };

const AMOUNT_KEYS   = new Set(["AMMOUNT","AMOUNT","BALANCE","OUT_AMMOUNT","CRE_AMMOUNT","DEB_AMMOUNT","TOTAL","TOTAL_PAYMENT","NET","TOTAL_INV","TOTAL_PAY","TOTAL_BAL","INV_TOTAL","PAY_TOTAL","PAYMENTS","CREDITS","DEBITS","ACCUMULATED"]);
const DATE_KEYS     = new Set(["APDATE","DATE_DUE","INV_DATE","INVOICE_DATE","DATE","DUE_DATE","LDATE","LASTDATE","DOC_DATE","PDATE","PAYMENT_DATE","OUT_DATE"]);
const VFP_SKIP      = new Set(["REPORTE","TITULO","PDF","FRX","NOMBRE_REPORTE","REPORT","TITLE","XLS","XLS_FILE","XLSFILE","SUBTITULO","TITULO_REPORTE","SUBTITU","NOMBRE_TITULO","SUB_TITULO"]);
const INTERNAL_SKIP = new Set(["UNICO","SUPPLIER_UQ","GROWER_UQ"]);
const CONTACT_SKIP  = new Set(["ADDRESS","CITY","PHONE","FAX","EMAIL","MANAGER","PHONE_FAX","PHONE FAX"]);
const GROWER_COLS   = new Set(["GROWER","SUPPLIER","GROWER_NAME","SUPPLIER_NAME"]);

const skipKey = (key: string) => {
    const ku = key.replace(/ /g, "_").toUpperCase();
    return VFP_SKIP.has(ku) || VFP_SKIP.has(key.toUpperCase()) || INTERNAL_SKIP.has(ku) || CONTACT_SKIP.has(ku) || CONTACT_SKIP.has(key);
};

function buildColumns(rows: any[], isSingleVendor: boolean): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(key => {
        if (skipKey(key)) return false;
        const ku = key.replace(/ /g, "_").toUpperCase();
        if (isSingleVendor && (GROWER_COLS.has(ku) || GROWER_COLS.has(key))) return false;
        return true;
    }).map(key => ({
        key,
        label: key.replace(/_/g, " "),
        width: AMOUNT_KEYS.has(key) ? 1.2 : DATE_KEYS.has(key) ? 1.0 : 1.6,
        align: (AMOUNT_KEYS.has(key) ? "right" : "left") as "left" | "right",
        render: (row: any) => { const v = row[key]; if (DATE_KEYS.has(key)) return fmtDate(v); if (AMOUNT_KEYS.has(key)) return fmt(v); if (v instanceof Date) return fmtDateTime(v); return t(v); },
    }));
}

export async function GET(req: NextRequest) {
    const sp          = req.nextUrl.searchParams;
    const grower_uq   = sp.get("grower_uq")  ?? "";
    const ldfrom      = sp.get("ldfrom")     ?? new Date("2000-01-01").toISOString();
    const ldto        = sp.get("ldto")       ?? new Date().toISOString();
    const lnoption    = parseInt(sp.get("lnoption") ?? "1", 10);
    const grower_name = sp.get("grower_name") ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_invoices_report2", {
            lcgrower_uq: grower_uq,
            ldfrom,
            ldto,
            lnoption,
        }),
        getCompanyInfo(),
    ]);

    const rows           = r.recordset ?? [];
    const isSingleVendor = !!grower_uq;
    const first          = rows[0];

    const vendorInfo: VendorInfo | undefined = isSingleVendor && first ? {
        name:    t(first.GROWER ?? first.SUPPLIER ?? first.GROWER_NAME ?? grower_name),
        address: t(first.ADDRESS ?? ""),
        city:    t(first.CITY    ?? ""),
        phone:   t(first.PHONE   ?? first["PHONE FAX"] ?? first.PHONE_FAX ?? ""),
        email:   t(first.EMAIL   ?? ""),
        manager: t(first.MANAGER ?? ""),
    } : undefined;

    if (sp.get("format") === "csv") {
        const allKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
        const keys    = allKeys.filter(k => !skipKey(k));
        const header  = keys.join(",");
        const body    = rows.map(row => keys.map(k => { const v = row[k]; const s = DATE_KEYS.has(k) ? fmtDate(v) : AMOUNT_KEYS.has(k) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g, '""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ap_summary_${grower_uq || "all"}.csv"` } });
    }

    const columns = buildColumns(rows, isSingleVendor);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = [
        vendorInfo?.name ? `Vendor: ${vendorInfo.name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(ldfrom)} to ${fmtDate(ldto)}`,
        `${rows.length} record(s)`,
    ].join("  |  ");

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="AP Summary"
            subtitle={subtitle}
            columns={columns}
            rows={rows}
            landscape={true}
            vendorInfo={vendorInfo}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="ap_summary_${grower_uq || "all"}.pdf"`,
        },
    });
}
