import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_customers_shipto_insert", {
            lccustomer_uq:  txt(b.cust_uq),
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
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Ship-to created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
