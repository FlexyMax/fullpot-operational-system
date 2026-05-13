import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const invoice_uq = searchParams.get("invoiceUq");

        if (!invoice_uq) {
            return NextResponse.json({ success: false, message: "Invoice ID is required" }, { status: 400 });
        }

        // sp_NC_invoice_details
        const result = await executeProcedure("sp_NC_invoice_details", {
            lcinvoice_uq: invoice_uq,
            lcsalesman: (session.user as any).id,
        });

        return NextResponse.json({ success: true, details: result.recordset });
    } catch (error: any) {
        console.error("Invoice Details error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
