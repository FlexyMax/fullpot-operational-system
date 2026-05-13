import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { line_uq, box_qty, price, product_uq } = body;

        // sp_NC_invoice_flexymax_box_update
        // Params: @lcUser_uq, @lcCompany_uq, @lcAppPage_uq, @lcunico, @lnbox_qty, @lnunits_x_box, @lnprice, @llapproved, @lcProduct_uq
        const result = await executeProcedure("sp_NC_invoice_flexymax_box_update", {
            lcUser_uq: (session.user as any).id,
            lcCompany_uq: process.env.COMPANY_ID || 'R7X98780',
            lcAppPage_uq: 'SALES_APP',
            lcunico: line_uq,
            lnbox_qty: box_qty,
            lnunits_x_box: 1,
            lnprice: price,
            llapproved: 1,
            lcProduct_uq: product_uq || ''
        });

        return NextResponse.json({ success: true, result: result.recordset });
    } catch (error: any) {
        console.error("Update Cart Item error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
