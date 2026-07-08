import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA    = "52961702";
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
    const page   = parseInt(req.nextUrl.searchParams.get("page")   ?? "1");
    const size   = parseInt(req.nextUrl.searchParams.get("size")   ?? String(PAGE_SIZE));
    const search = req.nextUrl.searchParams.get("search") ?? "";
    try {
        const r = await executeProcedure("sp_NC_carrier_list", {
            lnPageNumber: page,
            lnRowsOfPage: size,
            lccarrier:    search,
        });
        const rows  = r.recordset ?? [];
        const total = rows[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({ rows, total, page });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_carriers_insert", {
            lccode:           String(b.carriercode ?? "").substring(0, 4),
            lccarrier:        String(b.carrier ?? ""),
            lccontact:        String(b.contact ?? ""),
            lcaddress:        String(b.address ?? ""),
            lccity:           String(b.city ?? ""),
            lcstate:          String(b.state ?? "").substring(0, 4),
            lczip:            String(b.zip ?? ""),
            lccountry:        String(b.country ?? ""),
            lcphone_1:        String(b.phone_1 ?? ""),
            lcphone_2:        String(b.phone_2 ?? ""),
            lcfax_1:          String(b.fax_1 ?? ""),
            lcfax_2:          String(b.fax_2 ?? ""),
            lcemail:          String(b.email ?? ""),
            lcship_account:   String(b.ship_account ?? ""),
            ldcut_off:        b.cut_off || null,
            lcproduct_uq:     String(b.product_uq ?? ""),
            lnfreight_charge: parseFloat(b.freight_charge) || 0,
            llactive:         b.active ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        const unico = row?.unico ?? "";

        // Extended fields — requires sp_NC_carriers_update_settings (pending authorization)
        if (unico) {
            try {
                await executeProcedure("sp_NC_carriers_update_settings", {
                    lcunico:       unico,
                    lctwf_id:      String(b.twf_id ?? ""),
                    llsend_twf:    b.send_twf ? 1 : 0,
                    lcusername:    String(b.username ?? ""),
                    lcpassword:    String(b.password ?? ""),
                    llisairline:   b.isairline ? 1 : 0,
                    llchk_account: b.chk_account ? 1 : 0,
                    llchk_zone:    b.chk_zone ? 1 : 0,
                    lclenght_acc:  String(b.lenght_acc ?? ""),
                    lcbarcode:     String(b.barcode ?? ""),
                    lccfs_code:    String(b.cfs_code ?? ""),
                });
            } catch { /* SP not yet created */ }
        }

        serverAuditLog(PANTA, "Insert", "flower_carriers", unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: row?.message || "Carrier created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
