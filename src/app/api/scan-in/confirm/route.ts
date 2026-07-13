import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "CC10436A";

// POST /api/scan-in/confirm
// body: { awb }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { awb } = await req.json();
    if (!awb) return NextResponse.json({ error: "awb is required" }, { status: 400 });

    try {
        const result = await executeProcedure("sp_flower_packing_box_update_confirmed", {
            lcawbcode: String(awb).trim().toUpperCase(),
        });
        const row = result.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from SP" }, { status: 400 });
        if (row.Error === true || row.Error === 1) {
            return NextResponse.json({ error: String(row.Message ?? "Confirm failed") }, { status: 400 });
        }
        serverAuditLog(PANTA, "Edit", "flower_packing_box_control", String(awb), "Confirm AWB Reception").catch(() => {});
        return NextResponse.json({ success: true, message: String(row.Message ?? "AWB confirmed") });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
