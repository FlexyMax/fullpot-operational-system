import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_quotas", { lcproduct_uq: unico });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { country, city, quota, growers_all, growers_list } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_products_quotas_insert", {
            lcproduct_uq: unico,
            lccountry:    country || "",
            lccity:       city    || "",
            lnquota:      quota   || 0,
            llgrowers_all:  growers_all  ? 1 : 0,
            llgrowers_list: growers_list ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.Unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
