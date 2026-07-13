import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "CC10436A";

// GET /api/scan-in/delayed?pk_box_uq=XXX
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pk_box_uq = req.nextUrl.searchParams.get("pk_box_uq")?.trim();
    if (!pk_box_uq) return NextResponse.json({ error: "pk_box_uq required" }, { status: 400 });

    try {
        const result = await executeProcedure("sp_flower_packing_box_unconfirmed", { lcpkbox_uq: pk_box_uq });
        return NextResponse.json(result.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/scan-in/delayed — insert
// body: { pk_box_uq, reason_uq, qty, notes }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pk_box_uq, reason_uq, qty, notes } = await req.json();
    if (!pk_box_uq || !reason_uq || qty === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const result = await executeProcedure("sp_flower_packing_box_unconfirmed_insert", {
            lcpacking_box_uq: String(pk_box_uq),
            lcreason_uq:      String(reason_uq),
            lnqty:            Number(qty),
            lcnotes:          String(notes ?? ""),
        });
        const row = result.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from SP" }, { status: 400 });
        if (row.Error === true || row.Error === 1) {
            return NextResponse.json({ error: String(row.Message ?? "Insert failed") }, { status: 400 });
        }
        serverAuditLog(PANTA, "Insert", "flower_packing_box_unconfirmed", String(row.unico ?? pk_box_uq), "Delayed box").catch(() => {});
        return NextResponse.json({ success: true, unico: row.unico, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/scan-in/delayed — update
// body: { unico, pk_box_uq, reason_uq, qty, notes }
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { unico, pk_box_uq, reason_uq, qty, notes } = await req.json();
    if (!unico || !pk_box_uq || !reason_uq || qty === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const result = await executeProcedure("sp_flower_packing_box_unconfirmed_update", {
            lcdelayed_uq:     String(unico),
            lcpacking_box_uq: String(pk_box_uq),
            lcreason_uq:      String(reason_uq),
            lnqty:            Number(qty),
            lcnotes:          String(notes ?? ""),
        });
        const row = result.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from SP" }, { status: 400 });
        if (row.Error === true || row.Error === 1) {
            return NextResponse.json({ error: String(row.Message ?? "Update failed") }, { status: 400 });
        }
        serverAuditLog(PANTA, "Edit", "flower_packing_box_unconfirmed", String(unico), "Delayed box update").catch(() => {});
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/scan-in/delayed?unico=XXX
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const unico = req.nextUrl.searchParams.get("unico")?.trim();
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });

    try {
        const result = await executeProcedure("sp_flower_packing_box_unconfirmed_delete", { lcdelayed_uq: unico });
        const row = result.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No response from SP" }, { status: 400 });
        if (row.Error === true || row.Error === 1) {
            return NextResponse.json({ error: String(row.Message ?? "Delete failed") }, { status: 400 });
        }
        serverAuditLog(PANTA, "Delete", "flower_packing_box_unconfirmed", unico, "Delayed box delete").catch(() => {});
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
