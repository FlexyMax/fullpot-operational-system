import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// POST = add grower to quota, DELETE = remove grower from quota
// sp_flower_products_buyers_quotas_growers_iud @lcfpbg_uq (quota unico), @lcgrower_uq, @lldelete

export async function POST(req: Request) {
    const { fpbg_uq, grower_uq } = await req.json();
    if (!fpbg_uq || !grower_uq) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_products_buyers_quotas_growers_iud", {
            lcfpbg_uq:  fpbg_uq,
            lcgrower_uq: grower_uq,
            lldelete:    0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { fpbg_uq, grower_uq } = await req.json();
    if (!fpbg_uq || !grower_uq) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_products_buyers_quotas_growers_iud", {
            lcfpbg_uq:   fpbg_uq,
            lcgrower_uq: grower_uq,
            lldelete:    1,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
