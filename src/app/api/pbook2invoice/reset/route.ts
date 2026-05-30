import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const date = String(b.date ?? "");
    const mode = String(b.mode ?? "delivery");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_prebook_to_invoice_insert", {
            lddate:    new Date(date),
            llpb_date: mode === "delivery" ? 1 : 0,
        });
        return NextResponse.json({ success: true, records: r.recordset?.length ?? 0 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
