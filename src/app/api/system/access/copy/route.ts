import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { userfrom_uq, userto_uq } = await req.json();
    if (!userfrom_uq || !userto_uq)
        return NextResponse.json({ error: "userfrom_uq and userto_uq required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_sistema_accesos_copy", {
            lcuser_from_uq: userfrom_uq,
            lcuser_to_uq:   userto_uq,
        }, true);
        return NextResponse.json({
            success: true,
            message: result.recordset[0]?.Message ?? result.recordset[0]?.message ?? "Done",
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
