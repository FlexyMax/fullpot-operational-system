import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_warehouses_physical_insert", {
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
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Warehouse created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
