import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PUT /api/pos/invoice/update
// sp_NC_invoice_update — all header fields
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const b = await req.json();
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_NC_invoice_update", {
            lcunico:        b.unico,
            lccporder_no:   b.cporder_no   ?? "",
            lccustomer_uq:  b.customer_uq  ?? "",
            lcsalesman_uq:  b.salesman_uq  ?? "",
            lcsales_cus_uq: b.sales_cus_uq ?? "",
            lccarrier_uq:   b.carrier_uq   || null,
            lcaccount:      b.account      ?? "",
            lczone:         b.zone         ?? "",
            ldinvoice_date: b.invoice_date ? new Date(b.invoice_date) : new Date(),
            lcshipto_uq:    b.shipto_uq    || null,
            lcship_name:    b.ship_name    ?? "",
            lcship_address: b.ship_address ?? "",
            lcship_city:    b.ship_city    ?? "",
            lcship_state:   b.ship_state   ?? "",
            lcship_zip:     b.ship_zip     ?? "",
            lcship_fax:     b.ship_fax     ?? "",
            lcship_phone:   b.ship_phone   ?? "",
            lcawbcode:      b.awbcode      ?? "",
            lcawbchild:     b.awbchild     ?? "",
            lcdetails:      b.details      ?? "",
            lccargo_uq:     b.cargo_uq     || null,
            llspecial:      b.special      ?? false,
            lcuser_uq:      userId,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.error === true)
            return NextResponse.json({ success: false, error: row.message || row.mensaje || "Failed" }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
