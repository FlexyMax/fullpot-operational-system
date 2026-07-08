import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        // sp_NC_carrier_get returns all fields (pending authorization — falls back to sp_flower_carrier_uq)
        let r;
        try {
            r = await executeProcedure("sp_NC_carrier_get", { lcunico: unico });
        } catch {
            r = await executeProcedure("sp_flower_carrier_uq", { lccarrier_uq: unico });
        }
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_carriers_update", {
            lcunico:          unico,
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

        // Extended fields — requires sp_NC_carriers_update_settings (pending authorization)
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

        serverAuditLog(PANTA, "Edit", "flower_carriers", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.message || "Carrier updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_carrier_delete", { lccarrier_uq: unico });
        const row = r.recordset?.[0];
        if (row?.error === 1) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_carriers", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.message || "Carrier deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
