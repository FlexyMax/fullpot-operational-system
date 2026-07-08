import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, ReportColumn } from "@/components/reports/ReportPDF";
import { t, fmtDate, skipKey, DATE_KEYS, fmtDateTime } from "@/lib/reports/reportUtils";

// SP: sp_flower_customers_by_salesman_report — param: lcsalesman_uq ("%" = all)

// Columns to exclude from the table (shown in header or irrelevant)
const SKIP = new Set([
    "IDENTITY_COLUMN", "SALESMAN_FNAME", "SALESMAN_LNAME", "SALESMAN_NAME",
    "GROUPNAME",  // used as group header
    "FAX_1", "FAX_2", "PHONE_2", "INSURANCE_FOR", "PRICE_MARGIN",
]);

// Friendly column labels
const LABELS: Record<string, string> = {
    CUSTOMER:     "Customer",
    OLD_CODE:     "Code",
    ADDRESS1:     "Address",
    STATE:        "State",
    ZIP:          "Zip",
    CONTACT:      "Contact",
    PHONE_1:      "Phone",
    CREDIT_LIMIT: "Credit Limit",
    CREDITHOLD:   "Credit Hold",
};

// Column widths (relative flex)
const WIDTHS: Record<string, number> = {
    CUSTOMER:     3,
    OLD_CODE:     1,
    ADDRESS1:     3,
    STATE:        0.8,
    ZIP:          1,
    CONTACT:      2,
    PHONE_1:      1.5,
    CREDIT_LIMIT: 1.2,
    CREDITHOLD:   1,
};

export async function GET(req: NextRequest) {
    const sp           = req.nextUrl.searchParams;
    const lcsalesman_uq = sp.get("lcunico") ?? "%";
    const name          = sp.get("name")    ?? "";

    let r: any, company: any;
    try {
        [r, company] = await Promise.all([
            executeProcedure("sp_flower_customers_by_salesman_report", { lcsalesman_uq }),
            getCompanyInfo(),
        ]);
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const rows: any[] = r.recordset ?? [];

    // Sort rows by group then customer
    rows.sort((a, b) => {
        const ga = t(a.GROUPNAME), gb = t(b.GROUPNAME);
        if (ga !== gb) return ga.localeCompare(gb);
        return t(a.CUSTOMER).localeCompare(t(b.CUSTOMER));
    });

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map((row: any) =>
            keys.map(k => {
                const v  = row[k];
                const ku = k.replace(/ /g, "_").toUpperCase();
                const s  = DATE_KEYS.has(ku) ? fmtDate(v) : v instanceof Date ? fmtDateTime(v) : t(v);
                return `"${s.replace(/"/g, '""')}"`;
            }).join(",")
        ).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="salesreps_customers.csv"`,
            },
        });
    }

    // Build columns from first row, applying skip / label / width overrides
    const columns: ReportColumn[] = rows.length
        ? Object.keys(rows[0])
            .filter(k => !SKIP.has(k.toUpperCase()) && !skipKey(k))
            .map(k => ({
                key:   k,
                label: LABELS[k.toUpperCase()] ?? k.replace(/_/g, " "),
                width: WIDTHS[k.toUpperCase()] ?? 1,
                align: (k.toUpperCase() === "CREDIT_LIMIT" ? "right" : "left") as "left" | "right",
            }))
        : [{ key: "_empty", label: "No data", width: 1 }];

    const subtitle = [
        lcsalesman_uq === "%" ? "All Salesmen" : name ? `Salesman: ${name}` : `Salesman: ${lcsalesman_uq}`,
        `${rows.length} record(s)`,
    ].join(" · ");

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="Customers by Salesman"
            subtitle={subtitle}
            columns={columns}
            rows={rows}
            group={{ key: "GROUPNAME", label: (row) => t(row.GROUPNAME) }}
            landscape
        />
    );
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="salesreps_customers.pdf"`,
        },
    });
}
