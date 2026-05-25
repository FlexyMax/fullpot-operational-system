import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await Promise.all([
            executeProcedure("sp_flower_terms", {}),
            executeProcedure("sp_flower_cargo_agencies_list", { lcactive: "0" }),
            executeProcedure("sp_flower_cities", { lcsearch: "%" }),
            executeProcedure("sp_flower_growers_types", { lcsearch: "%" }),
        ]);
        return NextResponse.json({
            terms:   r[0].recordset ?? [],
            agencies: r[1].recordset ?? [],
            cities:  r[2].recordset ?? [],
            groups:  r[3].recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
