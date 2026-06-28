import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const invoice_no = parseInt(req.nextUrl.searchParams.get("invoice_no") || "0", 10);
    const cporder_no = req.nextUrl.searchParams.get("cporder_no") || "";
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any)?.user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? null;
        const r = await executeProcedure("sp_flower_invoice_search", {
            lninvoice_no: invoice_no,
            lccporder_no: cporder_no,
            lcsalesman_uq: salesman_uq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
