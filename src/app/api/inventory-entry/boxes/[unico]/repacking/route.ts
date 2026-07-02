import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

export async function POST(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_repacking", {
            lcpacking_box_uq:       unico,
            lcvendor_uq:            str(b.vendor_uq, 8),
            lcphysical_destination: str(b.physical_destination, 8),
            lccase_uq:              str(b.case_uq, 8),
            lnbox_qty:              int(b.box_qty),
            lnpacks_box:            int(b.packs_box),
            lnup_x_pack:            int(b.up_x_pack),
            lnsales_price:          num(b.sales_price),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        const newUnico = row?.unico ?? row?.UNICO ?? row?.newpk_box_uq ?? unico;
        serverAuditLog(PANTA, "Insert", "flower_packing_box", newUnico, "Repacking").catch(() => {});
        return NextResponse.json({ success: true, unico: newUnico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
