import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    const r = await executeProcedure("sp_flower_product_list_not_inventory", {});
    return NextResponse.json(r.recordset ?? []);
}
