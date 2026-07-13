import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "XD6Z7058"; // APP Scan (shared with physical scan until scan-out gets its own pantalla record)

// POST /api/scan-out/confirm
// body: { pk_box_uq, invoice_box_uq, lnbox, invoice_no }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pk_box_uq, invoice_box_uq, lnbox, invoice_no } = await req.json();
    if (!pk_box_uq || !invoice_box_uq || lnbox === undefined || !invoice_no) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // 1. Insert scan-out record
        const insertR = await executeProcedure("sp_flower_packing_box_control_insert_out", {
            lcpk_box_uq:    String(pk_box_uq).trim(),
            lcinvoice_box_uq: String(invoice_box_uq).trim(),
            lnbox:          Number(lnbox),
        });

        const row = insertR.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from scan-out SP" }, { status: 400 });
        if (row.Error === true || row.Error === 1 || row.error === true || row.error === 1) {
            return NextResponse.json({ error: String(row.Message ?? row.message ?? "Scan-out failed") }, { status: 400 });
        }

        // 2. Get updated totals
        const summaryR = await executeProcedure("sp_flower_shipping_boxes_control_summary", {
            invoice_no: Number(invoice_no),
        });
        const s = summaryR.recordset?.[0] ?? {};

        // 3. Audit log (fire-and-forget)
        serverAuditLog(PANTA, "Insert", "flower_packing_box_control", String(pk_box_uq), "Scan Out").catch(() => {});

        return NextResponse.json({
            success: true,
            message: String(row.Message ?? row.message ?? "Box scanned out successfully"),
            totals: {
                scanned: Number(s.qty_out  ?? 0),
                toScan:  Number(s.to_read  ?? 0),
                total:   Number(s.box_qty  ?? 0),
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
