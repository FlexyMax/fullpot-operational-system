import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type P = { params: Promise<{ unico: string }> };
const txt = (v: string) => String(v ?? "").replace(/'/g, "''");
const num = (v: any) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
const str = (v: any, len = 250) => String(v ?? "").trim().substring(0, len);

// Full editable shape for the Update Line / Notes modal — sp_flower_prebook_box_notes
// only returns a display subset, not the fields sp_flower_prebook_box_update_from_ptinvoice
// needs back, so this reads flower_prebook_box directly.
export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`
            SELECT
                flower_prebook_box.unico, flower_prebook_box.pbook_uq, flower_prebook_box.product_uq, flower_prebook_box.case_uq,
                flower_prebook_box.qty_order, flower_prebook_box.packs_x_case, flower_prebook_box.up_x_pack, flower_prebook_box.units_x_box,
                flower_prebook_box.so_price, flower_prebook_box.pccode, flower_prebook_box.upc, flower_prebook_box.food, flower_prebook_box.cut_point,
                flower_prebook_box.details, flower_prebook_box.not_found, flower_prebook_box.retail_price, flower_prebook_box.upc_text,
                flower_prebook_box.food_uq, flower_prebook_box.boxcode2, flower_prebook_box.color_breakdown, flower_prebook_box.upc_notes,
                flower_prebook_box.additional_notes, flower_prebook_box.shiplist_notes, flower_prebook_box.void,
                flower_products.description, flower_cases.case_sh,
                flower_prebook.pbook_no, flower_prebook.cporder_no, convert(char(12), flower_prebook.pb_date) as pb_date,
                flower_customers.customer
            FROM flower_prebook_box
            INNER JOIN flower_prebook ON flower_prebook_box.pbook_uq = flower_prebook.unico
            INNER JOIN flower_customers ON flower_prebook.customer_uq = flower_customers.unico
            INNER JOIN flower_products ON flower_prebook_box.product_uq = flower_products.unico
            INNER JOIN flower_cases ON flower_prebook_box.case_uq = flower_cases.unico
            WHERE flower_prebook_box.unico = '${txt(unico)}'
        `);
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_prebook_box_update_from_ptinvoice", {
            lcunico: unico,
            lcproduct_uq: str(b.product_uq, 8),
            lccase_uq: str(b.case_uq, 8),
            lnqty_order: int(b.qty_order),
            lnpacks_x_case: int(b.packs_x_case),
            lnup_x_pack: int(b.up_x_pack),
            lnunits_x_box: int(b.units_x_box),
            lnso_price: num(b.so_price),
            lcpccode: str(b.pccode, 20),
            lcupc: str(b.upc, 20),
            llfood: b.food ? 1 : 0,
            lncut_point: int(b.cut_point),
            lcdetails: str(b.details, 250),
            llnot_found: b.not_found ? 1 : 0,
            lnretail_price: num(b.retail_price),
            lcupc_text: str(b.upc_text, 20),
            lcfood_uq: str(b.food_uq, 8),
            lcboxcode2: str(b.boxcode2, 20),
            lccolor_breakdown: str(b.color_breakdown, 250),
            lcupc_notes: str(b.upc_notes, 250),
            lcadditional_notes: str(b.additional_notes, 250),
            lcshiplist_notes: str(b.shiplist_notes, 250),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
