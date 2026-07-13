import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "CC10436A";

// POST /api/scan-in/scan
// body: { awb, barcode }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { awb, barcode } = await req.json();
    if (!awb || !barcode) {
        return NextResponse.json({ error: "awb and barcode are required" }, { status: 400 });
    }

    try {
        // sp_NC_* returns { unico, mensaje, error, total_pieces, read_pieces, to_scan_pieces, ... }
        // db.ts auto-throws on error=true using firstRow.mensaje (via || firstRow.mensaje in db.ts)
        const scanR = await executeProcedure("sp_NC_packing_awb_insert_pkbox_control", {
            lcawb:       String(awb).trim().toUpperCase(),
            lccompuesto: String(barcode).trim().toUpperCase(),
        });
        const row = scanR.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from scan SP" }, { status: 400 });

        serverAuditLog(PANTA, "Insert", "flower_packing_box_control", String(row.unico ?? barcode), "Scan IN AWB").catch(() => {});

        // SP returns updated totals directly — no need for a second SP call
        return NextResponse.json({
            success: true,
            message: String(row.mensaje ?? "Box scanned in"),
            totals: {
                totalPieces: Number(row.total_pieces  ?? 0),
                readPieces:  Number(row.read_pieces   ?? 0),
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
