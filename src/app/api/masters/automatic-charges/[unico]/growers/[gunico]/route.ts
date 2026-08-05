import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "1E2123EC";
const txt   = (v: any) => String(v ?? "").trim();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string; gunico: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { gunico } = await params;
        await executeProcedure("sp_flower_invoice_automatic_charges_growers_delete", {
            lcunico: txt(gunico),
        });
        serverAuditLog(PANTA, "Delete", "flower_invoice_automatic_charges_growers", txt(gunico)).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
