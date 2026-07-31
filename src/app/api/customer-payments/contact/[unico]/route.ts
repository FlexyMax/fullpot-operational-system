import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ unico: string }> }
) {
    const { unico } = await context.params;
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

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ unico: string }> }
) {
    const { unico } = await context.params;
    const safe = String(unico).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    if (!safe) return NextResponse.json({ success: false, error: "Invalid unico" }, { status: 400 });
    const { ap_email } = await req.json();
    // Standard SQL escaping for inline string — email validated client-side
    const safeEmail = String(ap_email ?? "").replace(/'/g, "''").substring(0, 200);
    try {
        await executeQuery(`UPDATE flower_customers SET ap_email = '${safeEmail}' WHERE unico = '${safe}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
