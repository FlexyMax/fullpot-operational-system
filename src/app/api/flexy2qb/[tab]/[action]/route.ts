import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── SPs confirmed NOT in DB (verified via EXEC test 2026-05-20) ───────────────
// sp_flower_awbs_delete                      → AWBs module: Delete AWB
// sp_flower_awbs_date_update                 → AWBs module: Change AWB Date
// sp_flower_awbs_charges_by_packing_template → AWBs module: Invoice Charges Template
// sp_flower_packing_duties_products_credit_report → AWBs module: Credits Duties report
//
// All other SPs that previously showed as "not found" DO exist — the DB user
// lacks VIEW DEFINITION permission, so sys.parameters returned no rows for them.
// They are executed below with no parameters (confirmed via EXEC with no args).

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
                    procName = "sp_NC_AWB_years";          // no params — confirmed via EXEC
                } else if (action === "dates") {
                    procName = "sp_NC_QB_awb_dates";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_NC_packing_box_to_qbooks";
                    spParams = { lnPageNumber: body.pageNo || 1, lnRowsOfPage: body.pageSize || 500, ldawb_date: body.ldawb_date };
                } else if (action === "ready") {
                    procName = "sp_flower_packing_box_ready_to_qbooks";  // no params
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
                    procName = "sp_NC_Vendor_Bills_Ready2Qbooks";         // no params
                }
                break;

            // ── Purchases OCharges ────────────────────────────────────────────
            case "ocharges":
                if (action === "years") {
                    procName = "sp_NC_AWB_years";                         // no params
                } else if (action === "dates") {
                    procName = "sp_NC_QB_awb_oc_dates";
                    spParams = { lnYears: body.lnYears };
                } else if (action === "not-ready") {
                    procName = "sp_flower_awb_charges_to_qbooks";
                    spParams = { ldawb_date: body.ldawb_date };
                } else if (action === "ready") {
                    procName = "sp_flower_awb_charges_ready_to_qbooks";  // no params
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
                    procName = "sp_NC_AWB_years";                         // no params
                } else if (action === "dates") {
                    procName = "sp_NC_accounts_pay_cr_qb_dates";
                    spParams = { lnYears: body.lnYears };
                } else if (action === "not-ready") {
                    procName = "sp_flower_accounts_pay_cr_qb_dates_credits";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "ready") {
                    procName = "sp_flower_accounts_pay_cr_qb_ready_to_qbooks";  // no params
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
                    procName = "sp_NC_flower_invoice_years";              // no params
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_dates_qbooks";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_flower_invoice_to_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "ready") {
                    procName = "sp_flower_invoice_ready_to_qbooks";      // no params
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
                    procName = "sp_NC_flower_invoice_years";              // no params
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_dates_qbooks";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_NC_invoice_costs_to_qbooks";
                    spParams = { ldinvoice_date: body.ldinvoice_date };
                } else if (action === "ready") {
                    procName = "sp_NC_invoice_costs_ready_to_qbooks";    // no params
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
                    procName = "sp_NC_flower_invoice_years";              // no params
                } else if (action === "dates") {
                    procName = "sp_NC_invoice_box_crdb_qb_dates";
                    spParams = { lnYear: body.lnYear };
                } else if (action === "not-ready") {
                    procName = "sp_flower_invoice_box_crdb_qb_dates_credits";
                    spParams = { ldcr_date: body.ldcr_date };
                } else if (action === "ready") {
                    procName = "sp_flower_invoice_box_crdb_qb_ready";    // no params
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
                    procName = "sp_flower_accounts_income_dates";        // no params
                } else if (action === "not-ready") {
                    procName = "sp_flower_accounts_income_dates_qb_list";
                    spParams = { ldin_date: body.ldin_date };
                } else if (action === "ready") {
                    procName = "sp_flower_accounts_income_dates_qb_ready"; // no params
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

        // Normalize column names: replace spaces with underscores so frontend keys work
        const normalizedData = (result.recordset || []).map((row: any) => {
            const normalized: any = {};
            for (const [key, value] of Object.entries(row)) {
                const normalizedKey = key.replace(/\s+/g, "_");
                normalized[normalizedKey] = value;
                // Also expose a fully upper-cased alias for consistency
                normalized[normalizedKey.toUpperCase()] = value;
            }
            return normalized;
        });

        return NextResponse.json({ success: true, data: normalizedData, message: result.recordset?.[0]?.message });
    } catch (error: any) {
        console.error("[flexy2qb api error]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
