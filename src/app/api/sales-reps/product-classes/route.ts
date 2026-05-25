import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const salesman_uq = req.nextUrl.searchParams.get("salesman_uq") || "";
    const not_in      = req.nextUrl.searchParams.get("not_in") === "1";
    try {
        if (not_in) {
            const r = await executeProcedure("sp_flower_salesmen_class_not_in", {
                lcsalesman_uq: salesman_uq,
            });
            return NextResponse.json(r.recordset ?? []);
        } else {
            const r = await executeProcedure("sp_flower_salesmen_class_prod", {
                lcsalesman_uq: salesman_uq,
                lcclass_uq:    "%",
            });
            return NextResponse.json(r.recordset ?? []);
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_salesmen_class_prod_insert", {
            lcclass_uq:    String(b.class_uq ?? ""),
            lcsalesman_uq: String(b.salesman_uq ?? ""),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: "Product class added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_salesmen_class_prod_delete", {
            lcunico: String(b.unico ?? ""),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: "Product class removed." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
