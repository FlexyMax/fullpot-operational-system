import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const b = await req.json();
        const r = await executeProcedure("sp_flower_standing_orders_detail_insert", {
            lcsorder_uq:         b.sorder_uq         ?? "",
            lccporder_no:        b.cporder_no        ?? "",
            lcproduct_uq:        b.product_uq        ?? "",
            lccase_uq:           b.case_uq           ?? "",
            lnqty_sorder:        parseInt(b.qty_sorder  ?? 1),
            lnpacks_box:         parseInt(b.packs_box   ?? 1),
            lnunits_pack:        parseInt(b.units_pack  ?? 1),
            lnso_price:          parseFloat(b.so_price   ?? 0),
            lcdetails:           b.details           ?? "",
            lcpccode:            b.pccode            ?? "",
            lcupc:               b.upc               ?? "",
            llfood:              b.food              ?? false,
            llstem_pack:         b.stem_pack         ?? false,
            lcfood_uq:           b.food_uq           ?? "",
            lcupc_text:          b.upc_text          ?? "",
            lnretail_price:      parseFloat(b.retail_price    ?? 0),
            lcboxcode2:          b.boxcode2          ?? "",
            lccolor_breakdown:   b.color_breakdown   ?? "",
            lcupc_notes:         b.upc_notes         ?? "",
            lcadditional_notes:  b.additional_notes  ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO ?? null });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
