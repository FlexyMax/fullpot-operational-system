import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM flower_products WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        // 49 params (lcunico first) — verified 2026-05-16
        const r = await executeProcedure("sp_flower_products_update_from_varieties", {
            lcunico:                unico,
            lctype_uq:              txt(b.type_uq || ""),
            lldis_type:             bit(b.dis_type),
            lcvariety_uq:           txt(b.variety_uq),
            lldis_class:            bit(b.dis_class),
            lldis_subclass:         bit(b.dis_subcla),
            lldis_variety:          bit(b.dis_variety),
            lccolor_uq:             txt(b.color_uq || ""),
            lldis_color:            bit(b.dis_color),
            lcgrade_uq:             txt(b.grade_uq || ""),
            lldis_grade:            bit(b.dis_grade),
            lccase_uq:              txt(b.case_uq || ""),
            lldis_case:             bit(b.dis_case),
            lnup_x_pack:            int(b.up_x_pack || 0),
            lcpack_unit:            txt(b.pack_unit || ""),
            llstem_pack:            bit(b.stem_pack),
            lnup_x_case:            int(b.up_x_case || 0),
            lnmin_pur_price:        num(b.min_pur_price || 0),
            lnsales_price:          num(b.sales_price || 0),
            llinv_track:            bit(b.inv_track),
            llactive:               bit(b.active !== false),
            llauto_description:     bit(b.auto_description !== false),
            llweb:                  bit(b.web),
            llmix_class:            bit(b.mix_class),
            llmix_subclass:         bit(b.mix_subclass),
            llmix_color:            bit(b.mix_color),
            llmix_grade:            bit(b.mix_grade),
            lcold_description:      txt(b.old_description || ""),
            lcold_code:             txt(b.old_code || ""),
            lcupc:                  txt(b.upc || ""),
            lcboxcode:              txt(b.boxcode || ""),
            lcboxcode2:             txt(b.boxcode2 || ""),
            lcremarks:              txt(b.remarks || ""),
            lccustomer_uq:          txt(b.customer_uq || ""),
            lnweight:               num(b.weight || 0),
            lnretail_price:         num(b.retail_price || 0),
            lcupc_text:             txt(b.upc_text || ""),
            lccolor_breakdown:      txt(b.color_breakdown || ""),
            lcupc_notes:            txt(b.upc_notes || ""),
            lcadditional_notes:     txt(b.additional_notes || ""),
            lnrotation:             int(b.rotation || 0),
            Country_of_Origin:      txt(b.country_of_origin || ""),
            Hardgoods_cost_per_unit: num(b.hardgoods_cost || 0),
            Labor_cost_per_unit:    txt(b.labor_cost || "0"),
            lcShopify_name:         txt(b.shopify_name || ""),
            lcShopify_color:        txt(b.shopify_color || ""),
            lcShopify_size:         txt(b.shopify_size || ""),
            lcShopify_subtype:      txt(b.shopify_subtype || ""),
            lcShopify_variety:      txt(b.shopify_variety || ""),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Product updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_delete", { lcproduct_uq: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Product deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
