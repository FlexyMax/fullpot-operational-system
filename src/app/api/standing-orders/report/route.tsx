import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, buildSubtitle } from "@/lib/reports/reportUtils";

// SP: sp_flower_standing_order_report  param: @lcunico varchar(8)
// Returns flat join of header + line data (header fields repeat per line row).

const COLUMNS: ReportColumn[] = [
    { key: "description",  label: "Description",  width: 2.8, align: "left"  },
    { key: "clase",        label: "Class",        width: 0.8, align: "left"  },
    { key: "variety",      label: "Variety",      width: 1.3, align: "left"  },
    { key: "color",        label: "Color",        width: 1.0, align: "left"  },
    { key: "grado",        label: "Grade",        width: 0.7, align: "left"  },
    { key: "case_sh",      label: "Case",         width: 1.0, align: "left"  },
    { key: "qty_sorder",   label: "Qty",          width: 0.7, align: "right", render: (r) => t(r.qty_sorder)   },
    { key: "pack",         label: "Pack",         width: 0.8, align: "left"  },
    { key: "up_x_pack",    label: "Un/Pk",        width: 0.7, align: "right", render: (r) => t(r.up_x_pack)   },
    { key: "packs_box",    label: "Pk/Box",       width: 0.7, align: "right", render: (r) => t(r.packs_box)   },
    { key: "total_units",  label: "Total Un",     width: 0.8, align: "right", render: (r) => t(r.total_units)  },
    { key: "so_price",     label: "Price",        width: 0.9, align: "right", render: (r) => fmt(r.so_price)   },
    { key: "total_price",  label: "Total",        width: 0.9, align: "right", render: (r) => fmt(r.total_price) },
];

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico") ?? "";
    if (!unico) return new Response("unico required", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_standing_order_report", { lcunico: unico }),
        getCompanyInfo(),
    ]);

    const rows  = r.recordset ?? [];
    const first = rows[0];
    if (!first) return new Response("Order not found", { status: 404 });

    const subtitle = buildSubtitle(
        t(first.customer  ?? first.CUSTOMER  ?? ""),
        `SO# ${t(first.sorder_no ?? first.SORDER_NO ?? "")}`,
        t(first.so_day    ?? first.SO_DAY    ?? ""),
        `${fmtDate(first.begin_date ?? first.BEGIN_DATE)} – ${fmtDate(first.end_date ?? first.END_DATE)}`,
        (first.carrier ?? first.CARRIER) ? `Carrier: ${t(first.carrier ?? first.CARRIER ?? "")}` : null,
        (first.terms   ?? first.TERMS)   ? `Terms: ${t(first.terms   ?? first.TERMS   ?? "")}` : null,
    );

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="Standing Order"
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
            landscape
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type":        "application/pdf",
            "Content-Disposition": `inline; filename="SO-${t(first.sorder_no ?? first.SORDER_NO ?? unico)}.pdf"`,
        },
    });
}
