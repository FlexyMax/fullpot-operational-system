import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeProcedure("sp_NC_flower_salesmen_lista", {});
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
