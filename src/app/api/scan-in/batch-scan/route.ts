import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "CC10436A";

// POST /api/scan-in/batch-scan — supervisor only (canDelete permission implied)
// body: { awb }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { awb } = await req.json();
    if (!awb) return NextResponse.json({ error: "awb is required" }, { status: 400 });

    const awbCode = String(awb).trim().toUpperCase();

    try {
        // Get list of pending lots with box counts
        const pendingR = await executeProcedure("sp_flower_packing_pending_scan", {
            lcawb:      awbCode,
            lcpack_uq:  "%",
        });
        const lots: any[] = pendingR.recordset ?? [];

        let scanned = 0;
        const errors: string[] = [];

        for (const lot of lots) {
            const farmLote = String(lot.farm_lote ?? "").trim();
            const boxQty   = Number(lot.box_qty  ?? 0);
            if (!farmLote || boxQty <= 0) continue;

            for (let i = 1; i <= boxQty; i++) {
                const barcode = farmLote + String(i).padStart(3, "0");
                try {
                    const r = await executeProcedure("sp_flower_packing_awb_insert_pkbox_control", {
                        lcawb:       awbCode,
                        lccompuesto: barcode,
                    });
                    const row = r.recordset?.[0];
                    if (row?.Error === true || row?.Error === 1) {
                        errors.push(`${barcode}: ${String(row.Message ?? "error")}`);
                    } else {
                        scanned++;
                        serverAuditLog(PANTA, "Insert", "flower_packing_box_control", String(row?.unico ?? barcode), `Batch Scan IN ${awbCode}`).catch(() => {});
                    }
                } catch (e: any) {
                    errors.push(`${barcode}: ${e.message}`);
                }
            }
        }

        return NextResponse.json({ success: true, scanned, errors });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
