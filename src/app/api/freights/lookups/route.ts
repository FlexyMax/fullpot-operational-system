import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const [seasons, cities, airlines, growers] = await Promise.all([
            executeProcedure("sp_flower_seasons_list",  { lcseason: "%" }),
            executeProcedure("sp_flower_cities",         { lccity:   "%" }),
            executeProcedure("sp_flower_airlines_list",  { llall: 0 }),
            executeProcedure("sp_flower_growers_list",   { llall: 0 }),
        ]);
        return NextResponse.json({
            seasons:  seasons.recordset,
            cities:   cities.recordset,
            airlines: airlines.recordset,
            growers:  growers.recordset,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
