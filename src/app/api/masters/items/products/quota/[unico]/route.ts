import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_quotas_uq", { lcquota_uq: unico });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { country, city, quota, growers_all, growers_list } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_products_quotas_update", {
            lcquota_uq:     unico,
            lccountry:      country || "",
            lccity:         city    || "",
            lnquota:        quota   || 0,
            llgrowers_all:  growers_all  ? 1 : 0,
            llgrowers_list: growers_list ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_quotas_delete", { lcquota_uq: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
