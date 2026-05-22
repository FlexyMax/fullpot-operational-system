import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── SPs confirmed NOT in DB (2026-05-21) ─────────────────────────────────────
// sp_flower_packing_stock_insert  → Tab 2: Send to Warehouse (insert new transfer)
// sp_NC_inventory_lot_history     → Stock List: Lot History modal

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ tab: string; action: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { tab, action } = await context.params;
        let procName = "";
        let spParams: Record<string, any> = {};

        switch (tab) {

            // ── Dashboard ─────────────────────────────────────────────────────
            case "dashboard":
                if (action === "years") {
                    procName = "sp_NC_AWB_years";                  // no params
                } else if (action === "list") {
                    procName = "sp_NC_transfer_stock_dashboard";
                    spParams = { lnYear: body.lnYear, lcClass: body.lcClass || "A" };
                }
                break;

            // ── Stock List ────────────────────────────────────────────────────
            case "stock":
                if (action === "years") {
                    procName = "sp_NC_AWB_years";
                } else if (action === "warehouses") {
                    procName = "sp_flower_warehouses_list";
                    spParams = { llall: true };
                } else if (action === "physical-warehouses") {
                    procName = "sp_flower_warehouse_physical_list";
                    spParams = { llall: true };
                } else if (action === "list") {
                    // NOTE: lcwphysical_uq must be "%" for ALL (not "" — empty returns 0 rows)
                    //       lcdescription must be "%" for no filter (LIKE wildcard)
                    procName = "sp_NC_packing_box_available_date";
                    spParams = {
                        lnPageNumber:         body.pageNo   || 1,
                        lnRowsOfPage:         body.pageSize || 50,
                        ldpacking_date_from:  body.dateFrom || null,
                        ldpacking_date_to:    body.dateTo   || null,
                        lcwphysical_uq:       body.warehouseUq || "%",
                        lcdescription:        body.search    || "%",
                    };
                } else if (action === "stock-by-box") {
                    procName = "sp_flower_whouse_box_stock";
                    spParams = { lcpkbox_uq: body.pkboxUq };
                } else if (action === "invoiced-by-box") {
                    procName = "sp_flower_packing_box_in_invoice_box";
                    spParams = { lcpkbox_uq: body.pkboxUq };
                } else if (action === "racks-by-invoice") {
                    procName = "sp_flower_warehouse_invoice_box_barcodes_racks";
                    spParams = { lcInvoice_box_uq: body.invoiceBoxUq };
                } else if (action === "racks-by-lot") {
                    procName = "sp_flower_warehouse_packing_box_barcodes_racks";
                    spParams = { lcPk_box_uq: body.pkboxUq };
                } else if (action === "delete-transfer") {
                    if (!body.unico || !body.userUq)
                        return NextResponse.json({ success: false, error: "unico and userUq required." }, { status: 400 });
                    procName = "sp_flower_packing_stock_delete";
                    spParams = { lcunico: body.unico, lcuser_uq: body.userUq };
                } else if (action === "update-transfer") {
                    if (!body.pkstockUq)
                        return NextResponse.json({ success: false, error: "pkstockUq required." }, { status: 400 });
                    procName = "sp_flower_packing_stock_update";
                    spParams = {
                        lcpkstock_uq: body.pkstockUq,
                        lnprice_x_u:  parseFloat(body.priceXU)  || 0,
                        lnbox_units:  parseInt(body.boxUnits)   || 0,
                    };
                } else if (action === "insert-transfer") {
                    // sp_flower_packing_stock_insert does not exist in the database
                    return NextResponse.json({ success: false, missing: true,
                        error: "sp_flower_packing_stock_insert is not available in the current database." });
                }
                break;

            // ── Transit Boxes ─────────────────────────────────────────────────
            case "transit":
                if (action === "years") {
                    procName = "sp_NC_AWB_years";
                } else if (action === "list") {
                    procName = "sp_NC_packing_box_transit";
                    spParams = {
                        lnYear:        body.lnYear,
                        lcdescription: body.search || "%",
                    };
                }
                break;

            // ── Cancelled Purchases ───────────────────────────────────────────
            case "cancellations":
                if (action === "dates") {
                    procName = "sp_flower_prebook_box_porder_cancel_dates"; // no params
                } else if (action === "list") {
                    procName = "sp_flower_prebook_box_porder_cancel_dates_prebooks";
                    spParams = { ldcancel_date: body.cancelDate };
                }
                break;

            // ── Quality Credits ───────────────────────────────────────────────
            case "credits":
                if (action === "search") {
                    procName = "sp_flower_inventory_quality_control";
                    spParams = { lcdescription: body.search || "%" };
                } else if (action === "by-box") {
                    procName = "sp_flower_packing_quality_credits";
                    spParams = { lcpkbox_uq: body.pkboxUq };
                } else if (action === "insert") {
                    const b = body;
                    if (!b.pkboxUq)   return NextResponse.json({ success: false, error: "pkboxUq required." }, { status: 400 });
                    if (!b.reasonUq)  return NextResponse.json({ success: false, error: "Reason is required." }, { status: 400 });
                    if (!b.crDate)    return NextResponse.json({ success: false, error: "Date is required." }, { status: 400 });
                    if (!b.crBoxes)   return NextResponse.json({ success: false, error: "Boxes is required." }, { status: 400 });
                    if (!b.amount)    return NextResponse.json({ success: false, error: "Amount is required." }, { status: 400 });
                    procName = "sp_flower_packing_quality_credits_insert";
                    spParams = {
                        lcpkbox_uq:           b.pkboxUq,
                        lcreason_uq:          b.reasonUq,
                        ldcr_date:            b.crDate,
                        lnbox_qty:            parseInt(b.crBoxes)          || 0,
                        lnamount:             parseFloat(b.amount)         || 0,
                        lcdetails:            b.notes                       ?? "",
                        lncr_units:           parseInt(b.crTotalUnits)     || 0,
                        lllabor_apply:        b.laborApply       ? true : false,
                        lnlabor_cost:         parseFloat(b.laborCost)      || 0,
                        llreplacement_apply:  b.replacementApply ? true : false,
                        lnreplacement:        parseFloat(b.replacementCost) || 0,
                        llfreight_apply:      b.freightApply     ? true : false,
                        llfarm_apply:         b.farmApply        ? true : false,
                        lnpercentage:         parseFloat(b.percentage)     || 0,
                        lnsuggested:          parseFloat(b.suggested)      || 0,
                        llpending:            b.pending          ? true : false,
                        lncr_units_box:       parseFloat(b.crUnitsBox)     || 0,
                        llwarning:            b.warning          ? true : false,
                        llcomments:           b.invAdjusts       ? true : false,
                        lncr_units_bunch:     parseInt(b.crUnitsBunch)     || 0,
                        llfumigation:         b.fumigation       ? true : false,
                        llchecked:            b.usda             ? true : false,
                        llshow_porcentage:    b.showPercent      ? true : false,
                        lnfumigation_cost:    parseFloat(b.fumigationCost) || 0,
                    };
                } else if (action === "update") {
                    const b = body;
                    if (!b.unico)     return NextResponse.json({ success: false, error: "unico required." }, { status: 400 });
                    if (!b.reasonUq)  return NextResponse.json({ success: false, error: "Reason is required." }, { status: 400 });
                    procName = "sp_flower_packing_quality_credits_update";
                    spParams = {
                        lcunico:              b.unico,
                        lcreason_uq:          b.reasonUq,
                        ldcr_date:            b.crDate,
                        lnbox_qty:            parseInt(b.crBoxes)          || 0,
                        lnamount:             parseFloat(b.amount)         || 0,
                        lcdetails:            b.notes                       ?? "",
                        lncr_units:           parseInt(b.crTotalUnits)     || 0,
                        lllabor_apply:        b.laborApply       ? true : false,
                        lnlabor_cost:         parseFloat(b.laborCost)      || 0,
                        llreplacement_apply:  b.replacementApply ? true : false,
                        lnreplacement:        parseFloat(b.replacementCost) || 0,
                        llfreight_apply:      b.freightApply     ? true : false,
                        llfarm_apply:         b.farmApply        ? true : false,
                        lnpercentage:         parseFloat(b.percentage)     || 0,
                        lnsuggested:          parseFloat(b.suggested)      || 0,
                        llpending:            b.pending          ? true : false,
                        lncr_units_box:       parseFloat(b.crUnitsBox)     || 0,
                        llwarning:            b.warning          ? true : false,
                        llcomments:           b.invAdjusts       ? true : false,
                        lncr_units_bunch:     parseInt(b.crUnitsBunch)     || 0,
                        llsent:               b.sent             ? true : false,
                        llfumigation:         b.fumigation       ? true : false,
                        llchecked:            b.usda             ? true : false,
                        llshow_porcentage:    b.showPercent      ? true : false,
                        lnfumigation_cost:    parseFloat(b.fumigationCost) || 0,
                    };
                } else if (action === "delete") {
                    if (!body.unico) return NextResponse.json({ success: false, error: "unico required." }, { status: 400 });
                    procName = "sp_flower_packing_quality_credits_delete";
                    spParams = { lcunico: body.unico };
                }
                break;

            // ── QC History ────────────────────────────────────────────────────
            case "history":
                if (action === "dates") {
                    procName = "sp_flower_packing_quality_credits_dates";
                    spParams = { lndate_filter: body.dateFilter ?? 1 };
                } else if (action === "list") {
                    procName = "sp_flower_packing_quality_credits_dates_credits";
                    spParams = {
                        lndate_filter: body.dateFilter ?? 1,
                        ldcr_date:     body.crDate,
                        lcgrower_uq:   body.growerUq || "%",
                    };
                }
                break;

            // ── Lookups ───────────────────────────────────────────────────────
            case "lookup":
                if (action === "reasons") {
                    procName = "sp_NC_CRDB_reasons_list";   // no params
                } else if (action === "years") {
                    procName = "sp_NC_AWB_years";
                } else if (action === "warehouses") {
                    procName = "sp_flower_warehouses_list";
                    spParams = { llall: true };
                } else if (action === "physical-warehouses") {
                    procName = "sp_flower_warehouse_physical_list";
                    spParams = { llall: true };
                }
                break;
        }

        if (!procName) {
            return NextResponse.json({ success: false, error: "Invalid action or tab" }, { status: 400 });
        }

        const result = await executeProcedure(procName, spParams);

        if (result.recordset?.[0]?.error === true || result.recordset?.[0]?.error === 1) {
            return NextResponse.json({ success: false, error: result.recordset[0].message || "Database Error" });
        }

        const total = result.recordset?.[0]?.QueryTotalRecords ?? result.recordset?.length ?? 0;
        return NextResponse.json({ success: true, data: result.recordset, total, message: result.recordset?.[0]?.message });
    } catch (error: any) {
        console.error("[qc api error]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
