import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// No salesmen list SP found — direct query on flower_salesmen (verified 2026-05-18)
export async function GET() {
    try {
        const r = await executeQuery(`SELECT unico, salesman_name, salesman_sh FROM flower_salesmen WHERE active=1 ORDER BY salesman_name`);
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
