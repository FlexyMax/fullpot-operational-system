import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM flower_warehouses_physical WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_warehouses_physical_update", {
            lcwhouse_uq:     unico,
            lcwp_name:       txt(b.wp_name),
            llcargo:         bit(b.cargo),
            llsend_xml:      bit(b.send_xml),
            llcharge:        bit(b.charge),
            lcaddress:       txt(b.address),
            lccity:          txt(b.city),
            lcstate:         txt(b.state),
            lczipcode:       txt(b.zipcode),
            lccountry:       txt(b.country),
            lcphone:         txt(b.phone),
            lcfax:           txt(b.fax),
            lcemail:         txt(b.email),
            lcgrower_uq:     txt(b.grower_uq),
            lnhandling_kg:   num(b.handling_kg),
            llsend_to_whouse: bit(b.send_to_whouse),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Warehouse updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_warehouses_physical_delete", { lcwhouse_uq: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Warehouse deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
