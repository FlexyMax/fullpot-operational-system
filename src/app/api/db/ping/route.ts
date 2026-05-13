import { NextResponse } from "next/server";
import { getSistemaPool } from "@/lib/db";

export async function GET() {
    try {
        console.log("--- DB PING START ---");
        const pool = await getSistemaPool();
        const result = await pool.request().query("SELECT 1 as connected");
        console.log("--- DB PING SUCCESS ---", result.recordset[0]);
        return NextResponse.json({ success: true, data: result.recordset[0] });
    } catch (error: any) {
        console.error("--- DB PING FAILED ---", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
