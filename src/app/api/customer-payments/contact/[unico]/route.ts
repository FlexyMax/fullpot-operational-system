import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ unico: string }> }
) {
    const { unico } = await context.params;
    // unico is a char(8) internal key — allow only alphanumeric to prevent injection
    const safe = String(unico).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    if (!safe) return NextResponse.json({}, { status: 400 });
    try {
        const r = await executeQuery(
            `SELECT ap_email, email, ap_fax, fax_1, ap_contact, contact, statement_by
             FROM flower_customers WHERE unico = '${safe}'`
        );
        return NextResponse.json(r.recordset[0] ?? {});
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
