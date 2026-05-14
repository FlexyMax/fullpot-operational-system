import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_customers_shipto_update", {
            lcunico:        unico,
            lnshipto:       int(b.shipto),
            lcname:         txt(b.name),
            lcaddress1:     txt(b.address1),
            lcaddress2:     txt(b.address2),
            lccity:         txt(b.city),
            lcstate:        txt(b.state),
            lczip:          txt(b.zip),
            lccountry:      txt(b.country),
            lccontact:      txt(b.contact),
            lcphone:        txt(b.phone),
            lcfax:          txt(b.fax),
            lczone:         txt(b.zone),
            lcregion:       txt(b.region),
            lcdistrict:     txt(b.district),
            lcdc_uq:        txt(b.dc_uq),
            lcroute_uq:     txt(b.route_uq),
            ll24hours:      bit(b.hours24),
            lntruck_days:   int(b.truck_days),
            lcedi_code:     txt(b.edi_code),
            lcglnumber:     txt(b.glnumber),
            lcduns:         txt(b.duns),
            lntax_percentage: num(b.tax_percentage),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Ship-to updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const chk = await executeQuery(`SELECT COUNT(*) total FROM flower_carriers_customers WHERE shipto_uq='${txt(unico)}'`);
        const total = chk.recordset[0]?.total ?? 0;
        if (total > 0) return NextResponse.json({ success: false, error: `You have ${total} related carrier records! Remove them first.` }, { status: 400 });
        const r = await executeProcedure("sp_flower_customers_shipto_delete", { lcunico: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Ship-to deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
