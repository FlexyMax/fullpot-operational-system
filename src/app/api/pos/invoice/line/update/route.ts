import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PUT /api/pos/invoice/line/update
// sp_NC_invoice_flexymax_box_update(@lcuser_uq, @lccompany_uq, @lcpanta_uq, @inv_box_uq, @lnbox_qty, @lnunits_x_box, @lnprice_x_u, @llapproved)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const b = await req.json();
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_NC_invoice_flexymax_box_update", {
            lcuser_uq:    userId,
            lccompany_uq: b.company_uq ?? "",
            lcpanta_uq:   b.panta_uq   ?? "",
            inv_box_uq:   b.inv_box_uq,
            lnbox_qty:    Number(b.box_qty  ?? 1),
            lnunits_x_box: Number(b.units_x_box ?? 1),
            lnprice_x_u:  Number(b.price   ?? 0),
            llapproved:   b.approved ?? false,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.error === true)
            return NextResponse.json({ success: false, error: row.message || row.mensaje || "Failed" }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
