import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_products_list_with_parameters", {
            lctype_uq: "%", lcclase_uq: "%", lcsubcla_uq: "%",
            lcvariety_uq: "%", lccolor_uq: "%", lcgrade_uq: "%", lccase_uq: "%",
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
