import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { unico } = await params;
    try {
        const b = await req.json();
        const r = await executeProcedure("sp_flower_standing_orders_header_update", {
            lcunico:        unico,
            lccustomer_uq:  b.customer_uq  ?? "",
            lcterms_uq:     b.terms_uq     ?? "",
            lcsalesman_uq:  b.salesman_uq  ?? "",
            ldstdate:       b.start_date   ? new Date(b.start_date) : new Date(),
            ldendate:       b.end_date     ? new Date(b.end_date)   : new Date("2125-12-31"),
            lccarrier_uq:   b.carrier_uq   || null,
            lccargo_uq:     b.cargo_uq     || null,
            lcwhouse_uq:    b.whouse_uq    ?? "",
            lcday:          b.day          ?? "",
            lccporder_no:   b.cporder_no   ?? "",
            lcship_name:    b.ship_name    ?? "",
            lcship_address: b.ship_address ?? "",
            lcship_city:    b.ship_city    ?? "",
            lcship_state:   b.ship_state   ?? "",
            lcship_zip:     b.ship_zip     ?? "",
            lcship_fax:     b.ship_fax     ?? "",
            lcship_phone:   b.ship_phone   ?? "",
            lcinstructions: b.instructions ?? "",
            llactive:       b.active       ?? true,
            lnfactor:       parseInt(b.factor   ?? 1),
            lcshipto_uq:    b.shipto_uq    ?? "",
            lnweeks_no:     parseInt(b.weeks_no ?? 0),
            lcgrower_uq:    b.grower_uq    ?? "",
            lcship_day:     b.ship_day     ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_standing_orders_header_delete", {
            lcso_uq: unico,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
