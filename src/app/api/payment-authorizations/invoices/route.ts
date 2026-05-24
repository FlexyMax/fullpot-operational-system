import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// Normalize sp_flower_growers_pending_invoices rows to match sp_flower_supplier_invoices shape
function normalizePending(rows: any[]) {
    return rows.map(r => ({
        supplier_uq: r.supplier_uq,
        acc_pay_uq:  r.unico,          // header unico — best proxy for payments lookup
        unico:       r.unico,
        days:        null,
        invoice_no:  r.invoice_no,
        ap_date:     null,
        apdate:      r.ap_date,
        percen:      r.discount,
        date_due:    null,
        ammount:     r.ammount,
        out_ammount: r.out_ammount,
        cre_ammount: r.cre_ammount,
        deb_ammount: r.deb_ammount,
        balance:     r.total_balance,
        pay:         false,
        porder_no:   0,
        approved:    null,
        accumulated: null,
    }));
}

export async function GET(req: NextRequest) {
    const supplier_uq = req.nextUrl.searchParams.get("supplier_uq") ?? "";
    const balance     = req.nextUrl.searchParams.get("balance") ?? "pos"; // pos | zero | all
    if (!supplier_uq) return NextResponse.json({ error: "supplier_uq required" }, { status: 400 });

    const DATE_FROM = new Date("2000-01-01");
    const DATE_TO   = new Date("2099-12-31");

    try {
        if (balance === "pos") {
            // BAL > 0 — use header-level SP (total_balance = ammount)
            const r = await executeProcedure("sp_flower_growers_pending_invoices", {
                lcsupplier_uq: supplier_uq,
                lddatefrom:    DATE_FROM,
                lddateto:      DATE_TO,
            });
            return NextResponse.json(normalizePending(r.recordset));
        }

        if (balance === "zero") {
            // BAL = 0 — paid invoices (detail-level)
            const r = await executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 0,
            });
            return NextResponse.json(r.recordset);
        }

        // ALL — pending (header) + paid (detail), deduplicated by invoice unico
        const [pending, paid] = await Promise.all([
            executeProcedure("sp_flower_growers_pending_invoices", {
                lcsupplier_uq: supplier_uq,
                lddatefrom:    DATE_FROM,
                lddateto:      DATE_TO,
            }),
            executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 0,
            }),
        ]);
        const seen = new Set<string>();
        const merged = [
            ...normalizePending(pending.recordset),
            ...paid.recordset,
        ].filter(row => {
            const key = String(row.unico ?? row.UNICO ?? JSON.stringify(row));
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return NextResponse.json(merged);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
