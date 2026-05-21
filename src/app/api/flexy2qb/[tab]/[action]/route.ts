import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── SPs confirmed missing from DB (document for search in other DB) ──────────
// sp_NC_AWB_years                          → years dropdown for AWB tabs
// sp_NC_flower_invoice_years               → years dropdown for Sales tabs
// sp_flower_packing_box_ready_to_qbooks    → Purchases2QB READY list
// sp_NC_Vendor_Bills_Ready2Qbooks          → Purchases2QB TPO ready list
// sp_flower_awb_charges_ready_to_qbooks    → Purchases OCharges READY list
// sp_flower_accounts_pay_cr_qb_ready_to_qbooks → Purchases Credits READY list
// sp_flower_invoice_ready_to_qbooks        → Sales2QB READY list
// sp_NC_invoice_costs_ready_to_qbooks      → Sales Costs READY list
// sp_flower_invoice_box_crdb_qb_ready      → Sales Credits READY list
// sp_flower_accounts_income_dates          → Customer Payments dates list
// sp_flower_accounts_income_dates_qb_ready → Customer Payments READY list

function staticYears() {
    const cur = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({ year: cur - i }));
}

function missingSpResponse(spName: string) {
    return NextResponse.json({ success: false, missing: true, data: [],
        error: `${spName} is not available in the current database.` });
}

export async function POST(req: NextRequest, context: { params: Promise<{ tab: string; action: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const params = await context.params;
        const { tab, action } = params;
        let procName = "";
        let spParams: Record<string, any> = {};

        switch (tab) {

            // ── Dashboard ─────────────────────────────────────────────────────
            case "dashboard":
                if (action === "get") {
                    procName = "sp_AR_accouts_rec_dashboard";
                    spParams = { lcCustomerType: body.lcCustomerType };
                }
                break;

            // ── Purchases2QB ──────────────────────────────────────────────────
            case "purchases":
                if (action === "years") {
                    // sp_NC_AWB_years does not exist — return static year list
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_QB_awb_dates";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_NC_packing_box_to_qbooks";
                    spParams = { lnPageNumber: body.pageNo || 1, lnRowsOfPage: body.pageSize || 500, ldawb_date: body.ldawb_date };
                } else if (action === "ready") {
                    // sp_flower_packing_box_ready_to_qbooks does not exist
                    return missingSpResponse("sp_flower_packing_box_ready_to_qbooks");
                } else if (action === "sent") {
                    procName = "sp_flower_packing_box_in_qbooks";
                    spParams = { ldawb_date: body.ldawb_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_packing_update_ready_to_qbooks";
                    spParams = { lcpacking_box: body.lcpacking_box || "", lcawbcode: body.lcawbcode, llready: body.llready };
                } else if (action === "update-ready-invoice") {
                    procName = "sp_flower_packing_update_ready_to_qbooks_by_invoice";
                    spParams = { lcpacking_uq: body.lcpacking_uq, llready: body.llready };
                } else if (action === "update-ready-date") {
                    procName = "sp_NC_packing_update_ready_to_qbooks";
                    spParams = { ldAwbDate: body.ldAwbDate, llready: body.llready };
                } else if (action === "send") {
                    procName = "sp_flower_packing_update_sent_to_qbooks";
                    spParams = { lcawbcode_aux: body.lcawbcode_aux, llready: body.llready, llByReadyByDate: body.llByReadyByDate };
                } else if (action === "send-by-date") {
                    procName = "sp_NC_invoice_sales_send_to_qbooks_by_date";
                    spParams = { ldInvoice_date: body.ldInvoice_date, llsent: body.llsent };
                } else if (action === "tpo") {
                    // sp_NC_Vendor_Bills_Ready2Qbooks does not exist
                    return missingSpResponse("sp_NC_Vendor_Bills_Ready2Qbooks");
                }
                break;

            // ── Purchases OCharges ────────────────────────────────────────────
            case "ocharges":
                if (action === "years") {
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_QB_awb_oc_dates";
                    spParams = { lnYears: body.lnYears };
                } else if (action === "not-ready") {
                    procName = "sp_flower_awb_charges_to_qbooks";
                    spParams = { ldawb_date: body.ldawb_date };
                } else if (action === "ready") {
                    // sp_flower_awb_charges_ready_to_qbooks does not exist
                    return missingSpResponse("sp_flower_awb_charges_ready_to_qbooks");
                } else if (action === "sent") {
                    procName = "sp_flower_awb_charges_in_qbooks";
                    spParams = { ldawb_date: body.ldawb_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_awb_charge_ready_to_qbooks";
                    spParams = { lcCharge_uq: body.lcCharge_uq, llready: body.llready, llUpdateByDate: body.llUpdateByDate || false };
                } else if (action === "send") {
                    procName = "sp_flower_awb_charge_sent_to_qbooks";
                    spParams = { lcCharge_uq: body.lcCharge_uq, llready: body.llready, llByReadyByDate: body.llByReadyByDate || false };
                }
                break;

            // ── Purchases Credits ─────────────────────────────────────────────
            case "purchases-credits":
                if (action === "years") {
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_accounts_pay_cr_qb_dates";
                    spParams = { lnYears: body.lnYears };
                } else if (action === "not-ready") {
                    procName = "sp_flower_accounts_pay_cr_qb_dates_credits";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "ready") {
                    // sp_flower_accounts_pay_cr_qb_ready_to_qbooks does not exist
                    return missingSpResponse("sp_flower_accounts_pay_cr_qb_ready_to_qbooks");
                } else if (action === "sent") {
                    procName = "sp_flower_accounts_pay_cr_qb_sent_to_qbooks";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_accounts_pay_cr_update_ready_to_qbooks";
                    spParams = { lccr_uq: body.lccr_uq, llready: body.llready };
                } else if (action === "update-ready-date") {
                    procName = "sp_NC_accounts_pay_cr_update_ready_to_qbooks_by_date";
                    spParams = { lccr_uq: body.lccr_uq, llready: body.llready };
                } else if (action === "send") {
                    procName = "sp_flower_accounts_pay_cr_update_sent_to_qbooks";
                    spParams = { lccr_uq: body.lccr_uq, llready: body.llready, llSendByDate: body.llSendByDate || false };
                }
                break;

            // ── Sales2QB ──────────────────────────────────────────────────────
            case "sales":
                if (action === "years") {
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_dates_qbooks";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_flower_invoice_to_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "ready") {
                    // sp_flower_invoice_ready_to_qbooks does not exist
                    return missingSpResponse("sp_flower_invoice_ready_to_qbooks");
                } else if (action === "sent") {
                    procName = "sp_flower_invoice_in_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_invoice_update_ready_to_qbooks";
                    spParams = { lcinvoice_uq: body.lcinvoice_uq, llready: body.llready };
                } else if (action === "update-ready-date") {
                    procName = "sp_NC_invoice_sales_ready_to_qbooks_by_date";
                    spParams = { ldInvoice_date: body.ldInvoice_date, llsent: body.llsent };
                } else if (action === "send") {
                    procName = "sp_flower_invoice_update_sent_to_qbooks_by_invoice";
                    spParams = { lcinvoice_uq: body.lcinvoice_uq, llsent: body.llsent };
                } else if (action === "send-by-date") {
                    procName = "sp_NC_invoice_sales_send_to_qbooks_by_date";
                    spParams = { ldInvoice_date: body.ldInvoice_date, llsent: body.llsent };
                }
                break;

            // ── Sales Costs ───────────────────────────────────────────────────
            case "sales-costs":
                if (action === "years") {
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_dates_qbooks";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_NC_invoice_costs_to_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "ready") {
                    // sp_NC_invoice_costs_ready_to_qbooks does not exist
                    return missingSpResponse("sp_NC_invoice_costs_ready_to_qbooks");
                } else if (action === "sent") {
                    procName = "sp_NC_invoice_costs_in_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "update-ready") {
                    procName = "sp_NC_invoice_costs_update_ready_to_qbooks";
                    spParams = { lcinvoice_uq: body.lcinvoice_uq, llready: body.llready };
                } else if (action === "update-ready-date") {
                    procName = "sp_NC_invoice_costs_update_ready_by_date_to_qbooks";
                    spParams = { ldInvoice_date: body.ldInvoice_date, llready: body.llready };
                } else if (action === "send") {
                    procName = "sp_NC_invoice_update_sent_to_qbooks_by_invoice";
                    spParams = { lcinvoice_uq: body.lcinvoice_uq, llsent: body.llsent };
                } else if (action === "send-by-date") {
                    procName = "sp_NC_invoice_update_sent_to_qbooks_by_date";
                    spParams = { ldInvoice_date: body.ldInvoice_date, llsent: body.llsent };
                }
                break;

            // ── Sales Credits ─────────────────────────────────────────────────
            case "sales-credits":
                if (action === "years") {
                    return NextResponse.json({ success: true, data: staticYears() });
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_box_crdb_qb_dates";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_flower_invoice_box_crdb_qb_dates_credits";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "ready") {
                    // sp_flower_invoice_box_crdb_qb_ready does not exist
                    return missingSpResponse("sp_flower_invoice_box_crdb_qb_ready");
                } else if (action === "sent") {
                    procName = "sp_flower_invoice_box_crdb_qb_sent";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_invoice_box_crdb_update_ready_to_qbooks";
                    spParams = { lccr_uq: body.lccr_uq, llready: body.llready, ldCreditPay_date: body.ldCreditPay_date, llByReadyByDate: body.llByReadyByDate };
                } else if (action === "send") {
                    procName = "sp_flower_invoice_box_crdb_update_sent_to_qbooks";
                    spParams = { lccr_uq: body.lccr_uq, llready: body.llready, ldCreditPay_date: body.ldCreditPay_date, llByReadyByDate: body.llByReadyByDate };
                }
                break;

            // ── Customer Payments ─────────────────────────────────────────────
            case "payments":
                if (action === "dates") {
                    // sp_flower_accounts_income_dates does not exist
                    return missingSpResponse("sp_flower_accounts_income_dates");
                } else if (action === "not-ready") {
                    procName = "sp_flower_accounts_income_dates_qb_list";
                    spParams = { ldin_date: body.ldin_date };
                } else if (action === "ready") {
                    // sp_flower_accounts_income_dates_qb_ready does not exist
                    return missingSpResponse("sp_flower_accounts_income_dates_qb_ready");
                } else if (action === "sent") {
                    procName = "sp_flower_accounts_income_dates_qb_sent";
                    spParams = { ldin_date: body.ldin_date };
                } else if (action === "update-ready") {
                    procName = "sp_flower_accounts_income_update_ready_to_qbooks";
                    spParams = { lcincome_uq: body.lcincome_uq, llready: body.llready, llByReadyByDate: body.llByReadyByDate };
                } else if (action === "send") {
                    procName = "sp_flower_accounts_income_update_sent_to_qbooks";
                    spParams = { lcincome_uq: body.lcincome_uq, llready: body.llready, llByReadyByDate: body.llByReadyByDate };
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

        return NextResponse.json({ success: true, data: result.recordset, message: result.recordset?.[0]?.message });
    } catch (error: any) {
        console.error("[flexy2qb api error]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
