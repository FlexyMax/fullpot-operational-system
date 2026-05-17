import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_warehouses_bogo", {});
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { warehouse_uq, salesman_uq } = await req.json();
    if (!warehouse_uq) return NextResponse.json({ success: false, error: "Warehouse is required" }, { status: 400 });
    if (!salesman_uq)  return NextResponse.json({ success: false, error: "Salesman is required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_warehouses_bogo_insert", {
            lcwarehouse_uq: warehouse_uq,
            lcsalesman_uq:  salesman_uq,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
