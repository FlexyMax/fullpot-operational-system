import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/scan-out/order?invoice_no=12345
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoiceNo = parseInt(req.nextUrl.searchParams.get("invoice_no") ?? "", 10);
    if (isNaN(invoiceNo)) return NextResponse.json({ error: "Invalid invoice number" }, { status: 400 });

    try {
        const r = await executeProcedure("sp_flower_shipping_boxes_control", { invoice_no: invoiceNo });
        const rows: any[] = r.recordset ?? [];

        if (rows.length === 0) return NextResponse.json({ error: "Order not found or no boxes" }, { status: 404 });

        let total = 0, scanned = 0;
        for (const row of rows) {
            total   += Number(row.box_qty  ?? 0);
            scanned += Number(row.qty_out  ?? 0);
        }

        const first = rows[0];
        return NextResponse.json({
            orderNo:     String(invoiceNo),
            scanned,
            toScan:      Math.max(0, total - scanned),
            total,
            customer:    String(first.customer    ?? ""),
            destination: String(first.carrier     ?? ""),
            items:       rows,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
