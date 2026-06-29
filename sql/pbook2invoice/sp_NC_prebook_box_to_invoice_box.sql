CREATE PROCEDURE [dbo].[sp_NC_prebook_box_to_invoice_box]
    @lnPageNumber  int = 1,            -- reserved for future pagination, not yet wired into the web app — pass defaults
    @lnRowsOfPage  int = 0,            -- 0 = no paging (return everything), same as today's behavior
    @ldpb_date     datetime,
    @lccustomer_uq varchar(8),
    @llpb_date     bit,
    @lcproduct     varchar(50) = '%'
AS
-- ============================================================================
-- sp_NC_prebook_box_to_invoice_box
-- "NC" = New Code / web app version. Replaces, for the web app's Prebook to
-- Invoice > "Closed Prebook box by date and customer" (Lines) grid, the
-- legacy VFP proc:
--   sp_flower_prebook_box_to_invoice_box
-- (still used by the VFP desktop app, left completely untouched).
--
-- This rewrites an earlier draft of this same proc (the @AR/@QC table-
-- variable idea — pre-filter the prebook_box set, then join the quality-
-- control adjust aggregate to that filtered set — was exactly the right
-- direction) which had two issues: (1) its date-mode filter compared
-- @ldpb_date (a datetime) to the literals 0/1 instead of checking @llpb_date,
-- so it never actually switched between delivery/arrival filtering, and
-- (2) it still selected from the legacy unfiltered udf_flower_prebook_box_
-- purchase_control() — joining it to the pre-filtered @AR list AFTER the
-- fact doesn't help, because that function's own invoice-history join
-- (~2.7s) already runs unfiltered before @AR ever gets a chance to narrow
-- anything.
--
-- This version:
--   - calls dbo.udf_NC_prebook_box_purchase_control(@ld, @ld, @llpb_date) —
--     the lean, parameterized NC function built for the dates/customers
--     grids — which does the @AR table's job *inside itself* (a `boxes` CTE)
--     and, critically, also pre-filters the invoice-history join to that
--     same set before aggregating it.
--   - keeps the quality-control "adjust" aggregate filtered to `pbook_d_uq
--     IN (SELECT unico FROM boxes)`, same idea as the original @QC, just
--     inlined here instead of a separate table variable.
--   - the legacy proc's delivery branch joins flower_invoice_box by
--     pbook_d_uq (correct per-box invoice attribution — a prebook's boxes
--     can end up split across several invoices via Partial Invoice) while
--     its shipping branch instead joined flower_invoice directly via the
--     prebook-HEADER-level invoice_uq — not equivalent once a prebook has
--     been partially invoiced. This version joins via flower_invoice_box in
--     both modes, matching the (correct) delivery branch.
--   - @lcproduct keeps the web app's actual filter shape (a description
--     LIKE search, what the Lines panel's product search box already
--     sends) rather than the exact product_uq match from the earlier
--     draft, since that's what's actually wired up today.
--   - OPTION (RECOMPILE): @ld is a local variable, not this proc's own
--     parameter — without it, SQL Server can't sniff its actual value at
--     compile time and mis-estimates the function's join (same pitfall hit
--     and fixed for sp_NC_prebook_to_invoice_dates/customers).
-- ============================================================================
SET NOCOUNT ON

DECLARE @ld date = CAST(@ldpb_date AS date)
SET @lcproduct = '%' + RTRIM(@lcproduct) + '%'

;WITH boxes AS (
    SELECT * FROM dbo.udf_NC_prebook_box_purchase_control(@ld, @ld, @llpb_date)
)
SELECT
    boxes.unico,
    boxes.pbook_uq,
    boxes.sorder_no,
    boxes.cporder_no,
    boxes.product_uq,
    boxes.qty_order,
    qty_porder    = boxes.po_cases,
    qty_invoiced  = boxes.invoiced_cases,
    to_invoice    = boxes.qty_order - boxes.invoiced_cases,
    boxes_adjust  = ISNULL(adjust.boxes_adjust, 0),
    boxes.packs_x_case,
    boxes.up_x_pack,
    boxes.units_x_box,
    boxes.so_price,
    boxes.customer_uq,
    customer      = RTRIM(flower_customers.cust_code) + ' / ' + RTRIM(flower_carriers.carrier),
    description   = RTRIM(flower_products.description),
    pb_date       = boxes.pbdate,
    boxes.pbook_no,
    invoice_no    = ISNULL(flower_invoice.invoice_no, 0),
    boxes.invoice_uq,
    flower_invoice.invoice_date,
    flower_products.class_uq,
    flower_products.subclass_uq,
    flower_cases.case_sh,
    boxes.pccode,
    boxes.not_found,
    warehouse     = flower_warehouses_physical.wp_name,
    boxes.void
FROM boxes
INNER JOIN flower_carriers            ON boxes.carrier_uq = flower_carriers.unico
INNER JOIN flower_customers           ON boxes.customer_uq = flower_customers.unico
INNER JOIN flower_products            ON boxes.product_uq = flower_products.unico
INNER JOIN flower_cases               ON boxes.case_uq = flower_cases.unico
INNER JOIN flower_warehouses          ON boxes.whouse_uq = flower_warehouses.unico
INNER JOIN flower_warehouses_physical ON flower_warehouses.wphysical_uq = flower_warehouses_physical.unico

LEFT OUTER JOIN flower_invoice_box ON flower_invoice_box.pbook_d_uq = boxes.unico
LEFT OUTER JOIN flower_invoice     ON flower_invoice.unico = flower_invoice_box.invoice_uq

LEFT OUTER JOIN (
    -- ajustes control de calidad — same idea as the @QC table in the earlier draft
    SELECT flower_packing_box.pbook_d_uq,
        SUM(flower_packing_stock_adjusts.qtyboxes) AS boxes_adjust
    FROM flower_packing_stock_adjusts
    INNER JOIN flower_packing_stock ON flower_packing_stock_adjusts.pkstock_uq = flower_packing_stock.unico
    INNER JOIN flower_packing_box ON flower_packing_stock.pk_box_uq = flower_packing_box.unico
    WHERE flower_packing_box.pbook_d_uq IN (SELECT unico FROM boxes)
    GROUP BY flower_packing_box.pbook_d_uq
) AS adjust ON adjust.pbook_d_uq = boxes.unico

WHERE boxes.customer_uq LIKE @lccustomer_uq
  AND flower_products.description LIKE @lcproduct
ORDER BY flower_customers.customer, boxes.pbook_no, flower_products.description
-- OFFSET/FETCH left out on purpose — @lnPageNumber/@lnRowsOfPage are accepted
-- (so this signature is ready whenever paging actually gets wired into the
-- Lines grid) but not applied yet, same as the earlier draft's commented-out
-- OFFSET/FETCH lines.
OPTION (RECOMPILE)
