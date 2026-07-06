import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t  = (v: any) => String(v ?? "").trim();
const n  = (v: any) => { const x = parseInt(v ?? 0); return isNaN(x) ? "—" : x.toLocaleString("en-US"); };

const BOUQUET_COLS: ReportColumn[] = [
    { key: "variety",      label: "Variety",    width: 2.5 },
    { key: "grade",        label: "Grade",      width: 1 },
    { key: "variety_color",label: "Color",      width: 1 },
    { key: "variety_qty",  label: "Qty/Bunch",  width: 0.8, align: "right", render: r => n(r.variety_qty) },
    { key: "unit",         label: "Unit",       width: 0.8 },
    { key: "notes",        label: "Notes",      width: 2 },
];

const COMBO_COLS: ReportColumn[] = [
    { key: "variety",      label: "Variety",    width: 2.5 },
    { key: "grade",        label: "Grade",      width: 1 },
    { key: "variety_color",label: "Color",      width: 1 },
    { key: "variety_qty",  label: "Qty/Bunch",  width: 0.8, align: "right", render: r => n(r.variety_qty) },
    { key: "unit",         label: "Unit",       width: 0.8 },
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const [r, company] = await Promise.all([
            executeProcedure("sp_flower_products_composition_report", { lcproduct_uq: unico }),
            getCompanyInfo(),
        ]);

        const rows = r.recordset ?? [];
        if (rows.length === 0) {
            return new Response("No recipe data found for this product.", { status: 404, headers: { "Content-Type": "text/plain" } });
        }

        const hdr     = rows[0];
        const isCombo = t(hdr.titulo_reporte).includes("COMBO");
        const title   = t(hdr.titulo_reporte) || (isCombo ? "COMBO BOX COMPOSITION" : "BOUQUET COMPOSITION");
        const desc    = t(hdr.description);

        const productInfo = {
            name:    `${desc}${t(hdr.old_code) ? `  ·  EDI: ${t(hdr.old_code)}` : ""}${t(hdr.upc) ? `  ·  UPC: ${t(hdr.upc)}` : ""}`,
            address: `Bunches/Case: ${n(hdr.bunches_case)}   Units/Bunch: ${n(hdr.units_bunch)}   Total Units: ${n(hdr.total_units)}`,
            city:    `Box: ${t(hdr.case_sh)}${t(hdr.boxcode) ? `   Box Code: ${t(hdr.boxcode)}` : ""}${t(hdr.case_description) ? `   Dims: ${t(hdr.case_description)}` : ""}`,
            phone:   t(hdr.remarks) || undefined,
        };

        const buffer = await renderToBuffer(
            <ReportPDF
                company={company}
                title={title}
                subtitle={desc}
                columns={isCombo ? COMBO_COLS : BOUQUET_COLS}
                rows={rows}
                landscape={false}
                vendorInfo={productInfo}
                group={isCombo
                    ? { key: "bouquet", label: row => `${t(row.bouquet)}  —  ${n(row.bbunches_case)} bch/case` }
                    : { key: "grupo",   label: row => t(row.grupo) }
                }
            />
        );

        const filename = `recipe_${desc.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_")}.pdf`;
        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        });
    } catch (err: any) {
        return new Response(`PDF render error: ${err.message}`, { status: 500, headers: { "Content-Type": "text/plain" } });
    }
}
