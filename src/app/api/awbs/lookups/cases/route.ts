import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeQuery("SELECT unico, case_name, case_sh FROM flower_cases ORDER BY case_name");
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
