import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, getFullpotPool } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/physical-scan/scan  { compuesto, rack }
// SP returns: { unico C(8), mensaje C(xxx), error L }  (Spanish column names)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { compuesto, rack } = await req.json();
        if (!compuesto?.trim()) return NextResponse.json({ error: "Barcode required" }, { status: 400 });

        // Bypass executeProcedure's generic error check — this SP uses 'mensaje' (not 'message')
        const pool = await getFullpotPool();
        const request = pool.request();
        request.input("lccompuesto", compuesto.trim().toUpperCase());
        request.input("lcRack",      (rack?.trim() || "RACK").toUpperCase());
        const r   = await request.execute("sp_flower_physical_inventory_insert");
        const row = r.recordset?.[0];

        const hasError = row?.error === true || row?.error === 1;
        const msg      = String(row?.mensaje ?? row?.message ?? "").trim();

        // "Box already read. New position was updated." → treat as warning (scan accepted)
        const isWarning = hasError && (
            msg.toLowerCase().includes("already read") ||
            msg.toLowerCase().includes("position was updated")
        );

        if (hasError && !isWarning) {
            return NextResponse.json({ success: false, error: msg || "Scan rejected" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            warning: isWarning ? msg : undefined,
            unico:   row?.unico ?? null,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/physical-scan/scan — delete all scanned records (reset)
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        await executeProcedure("sp_flower_real_inventory_details_delete", {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
