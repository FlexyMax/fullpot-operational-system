import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ salesman_uq: string }> };

export async function GET(req: NextRequest, { params }: P) {
    const { salesman_uq } = await params;
    const destination = parseInt(req.nextUrl.searchParams.get("destination") || "1");
    try {
        // Note: SP param has typo @lndestinatination (3 n's) — verified in DB
        const r = await executeProcedure("sp_flower_salesman_customers", {
            lcsalesman_uq:     salesman_uq,
            lndestinatination: destination,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
