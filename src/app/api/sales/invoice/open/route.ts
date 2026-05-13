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
        const { customer_uq, ship_date } = body;

        if (!customer_uq) {
            return NextResponse.json({ success: false, message: "Customer is required" }, { status: 400 });
        }

        // Clean date for SP (YYYYMMDD)
        const dateClean = ship_date ? ship_date.replace(/-/g, '') : '';

        const result = await executeProcedure("sp_flower_invoice_insert", {
            lccustomer_uq: customer_uq,
            lcinvoice_date: dateClean,
            lcuser_uq: (session.user as any).id,
        });

        const invoice = result.recordset?.[0];

        if (invoice && (invoice.error === 1 || invoice.error === true)) {
            return NextResponse.json({ success: false, message: invoice.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        console.error("Open Invoice error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
