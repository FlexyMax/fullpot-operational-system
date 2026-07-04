import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

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
        serverAuditLog(PANTA, "Insert", "flower_warehouses_bogo", row?.unico ?? "", warehouse_uq).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
