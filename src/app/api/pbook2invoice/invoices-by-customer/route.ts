import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const customer_uq = req.nextUrl.searchParams.get("customer_uq") || "";
    const date = req.nextUrl.searchParams.get("date") || "";
    if (!customer_uq || customer_uq === "%") return NextResponse.json([]);
    if (!date) return NextResponse.json([]);
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any)?.user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? null;
        const r = await executeProcedure("sp_flower_customers_invoice_by_date", {
            ldinvoice_date: new Date(date),
            lccustomer_uq: customer_uq,
            lcsalesman_uq: salesman_uq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
