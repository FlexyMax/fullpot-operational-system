import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const result = await executeProcedure("sp_fweb_farms_class_prod_new");
        return NextResponse.json(result.recordset);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
