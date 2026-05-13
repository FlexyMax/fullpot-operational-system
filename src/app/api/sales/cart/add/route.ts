import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { invoice_uq, product_uq, box_qty, price, stock_uq } = body;

        // sp_flower_invoice_flexymax_box_insert
        // Params: @invoice_uq, @stock_uq, @product_uq, @box_qty, @price, @user_uq, @approved
        const result = await executeProcedure("sp_flower_invoice_flexymax_box_insert", {
            lcinvoice_uq: invoice_uq,
            lcstock_uq: stock_uq,
            lcproduct_uq: product_uq,
            lnbox_qty: box_qty,
            lnprice: price,
            lcuser_uq: (session.user as any).id,
            llapproved: 1
        });

        const line = result.recordset?.[0];

        if (line && (line.error === 1 || line.error === true)) {
            return NextResponse.json({ success: false, message: line.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, line });
    } catch (error: any) {
        console.error("Add Cart Item error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
