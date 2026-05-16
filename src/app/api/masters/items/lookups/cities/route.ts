import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "%";
    try {
        // Note: SP param is @lcccountry (3 c's — verified in DB)
        const r = await executeProcedure("sp_flower_cities_by_country", {
            lcccountry: country,
            llall:      1,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
