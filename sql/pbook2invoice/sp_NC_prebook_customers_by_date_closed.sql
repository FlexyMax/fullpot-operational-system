CREATE PROCEDURE [dbo].[sp_NC_prebook_customers_by_date_closed]
    @lddate     datetime,
    @llpb_date  bit = 1     -- 1 = Delivery (flower_prebook.pb_date), 0 = Arrival/Shipping (flower_prebook.whouse_date)
AS
-- ============================================================================
-- sp_NC_prebook_customers_by_date_closed
-- "NC" = New Code / web app version, created 2026-06-30. Replaces, for the
-- web app's Prebook to Invoice > Customers grid, the two legacy VFP procs:
--   sp_flower_prebook_customers_by_date_closed            (delivery / pb_date)
--   sp_flower_prebook_customers_by_shipping_date_closed   (arrival  / whouse_date)
-- Both legacy procs are left untouched and still used by the VFP desktop app.
--
-- Differences from the legacy pair (all confirmed with the requester before
-- building this):
--   1. One @llpb_date parameter picks delivery vs arrival, same idea as
--      sp_NC_prebook_to_invoice_dates, instead of two near-duplicate procs.
--   2. Calls dbo.udf_NC_prebook_box_purchase_control(@lddate, @lddate,
--      @llpb_date) — the parameterized lean NC function — instead of an
--      unfiltered call. That function pre-filters the prebook_box set
--      before joining the invoice history, which is what makes this fast
--      (see its header comment: that join alone was ~2.7s unfiltered).
--      Measured live: legacy proc ~2.5-2.8s -> this version ~0.15-0.2s.
--   3. Does NOT compute the "ALL customers" totals row the legacy procs
--      UNION ALL onto the end (customer_uq = '%'). The web app recomputes
--      that row itself by summing the per-customer rows this proc returns —
--      no reason to pay for the same aggregate twice in one call.
-- ============================================================================
SET NOCOUNT ON

DECLARE @ld date = CAST(@lddate AS date)

DECLARE @tablita TABLE (
    customer_uq    varchar(8),
    customer       varchar(60),
    pbdate         varchar(12),
    records        int,
    qty_order      int,
    qty_porder     numeric(10,2),
    qty_invoice    numeric(10,2),
    total_sale     numeric(12,2),
    total_purchase numeric(12,2),
    qty_ship       numeric(10,2),
    credit_limit   numeric(12,2)
)

IF @llpb_date = 1
BEGIN
    -- Delivery mode: customers with a closed prebook on flower_prebook.pb_date = @lddate
    ;WITH counts AS (
        SELECT customer_uq, CONVERT(char(12), pb_date) AS pbdate, COUNT(unico) AS records
        FROM flower_prebook
        WHERE DATEDIFF(day, pb_date, @lddate) = 0 AND closed = 1
        GROUP BY customer_uq, CONVERT(char(12), pb_date)
    ),
    sums AS (
        SELECT customer_uq, pbdate,
            SUM(qty_order)      AS qty_order,
            SUM(po_cases)       AS qty_porder,
            SUM(invoiced_cases) AS qty_invoice,
            SUM(total_sales)    AS total_sale,
            SUM(po_cost)        AS total_purchase,   -- flower + cargo cost (matches legacy sp_flower_prebook_customers_by_date_closed)
            SUM(ship_cases)     AS qty_ship
        FROM dbo.udf_NC_prebook_box_purchase_control(@ld, @ld, 1)
        GROUP BY customer_uq, pbdate
    )
    INSERT INTO @tablita (customer_uq, customer, pbdate, records, qty_order, qty_porder, qty_invoice, total_sale, total_purchase, qty_ship, credit_limit)
    SELECT
        cu.unico,
        RTRIM(cu.customer) + ' / ' + RTRIM(sm.salesman_fname),
        COALESCE(c.pbdate, s.pbdate),
        ISNULL(c.records, 0),
        ISNULL(s.qty_order, 0),
        ISNULL(s.qty_porder, 0),
        ISNULL(s.qty_invoice, 0),
        ISNULL(s.total_sale, 0),
        ISNULL(s.total_purchase, 0),
        ISNULL(s.qty_ship, 0),
        cu.credit_limit
    FROM counts c
    FULL OUTER JOIN sums s ON s.customer_uq = c.customer_uq
    INNER JOIN flower_customers cu ON cu.unico = COALESCE(c.customer_uq, s.customer_uq)
    INNER JOIN flower_salesmen sm ON sm.unico = cu.salesman_uq
    OPTION (RECOMPILE)   -- @ld is a local variable, not the proc's own param — without this,
                         -- SQL Server mis-estimates the udf_NC_prebook_box_purchase_control()
                         -- join badly (measured: ~4.6s without RECOMPILE vs ~0.2s with it)
END
ELSE
BEGIN
    -- Arrival/shipping mode: identical shape, filtered by flower_prebook.whouse_date instead
    ;WITH counts AS (
        SELECT customer_uq, CONVERT(char(12), whouse_date) AS whousedate, COUNT(unico) AS records
        FROM flower_prebook
        WHERE DATEDIFF(day, whouse_date, @lddate) = 0 AND closed = 1
        GROUP BY customer_uq, CONVERT(char(12), whouse_date)
    ),
    sums AS (
        SELECT customer_uq, shipdate,
            SUM(qty_order)      AS qty_order,
            SUM(po_cases)       AS qty_porder,
            SUM(invoiced_cases) AS qty_invoice,
            SUM(total_sales)    AS total_sale,
            SUM(po_cost)        AS total_purchase,
            SUM(ship_cases)     AS qty_ship
        FROM dbo.udf_NC_prebook_box_purchase_control(@ld, @ld, 0)
        GROUP BY customer_uq, shipdate
    )
    INSERT INTO @tablita (customer_uq, customer, pbdate, records, qty_order, qty_porder, qty_invoice, total_sale, total_purchase, qty_ship, credit_limit)
    SELECT
        cu.unico,
        RTRIM(cu.customer) + ' / ' + RTRIM(sm.salesman_fname),
        COALESCE(c.whousedate, s.shipdate),
        ISNULL(c.records, 0),
        ISNULL(s.qty_order, 0),
        ISNULL(s.qty_porder, 0),
        ISNULL(s.qty_invoice, 0),
        ISNULL(s.total_sale, 0),
        ISNULL(s.total_purchase, 0),
        ISNULL(s.qty_ship, 0),
        cu.credit_limit
    FROM counts c
    FULL OUTER JOIN sums s ON s.customer_uq = c.customer_uq
    INNER JOIN flower_customers cu ON cu.unico = COALESCE(c.customer_uq, s.customer_uq)
    INNER JOIN flower_salesmen sm ON sm.unico = cu.salesman_uq
    OPTION (RECOMPILE)
END

-- Final shape matches the legacy procs (minus the UNION ALL "ALL" row — see
-- header comment) — same color/tooltip traffic-light logic too.
SELECT
    customer_uq,
    customer,
    pbdate,
    records,
    qty_order,
    qty_porder,
    qty_invoice,
    qty_ship,
    total_sale,
    total_purchase,
    profit = CASE WHEN total_sale > 0 THEN (total_sale - total_purchase) * 100 / total_sale ELSE 0 END,
    credit_limit,
    color = (CASE
        WHEN qty_porder = 0 THEN 255
        WHEN qty_porder > 0 AND qty_porder < qty_order THEN 16744576
        WHEN qty_porder >= qty_order AND qty_ship = 0 THEN 16711680
        WHEN qty_ship > 0 AND qty_ship < qty_order THEN 11206570
        WHEN qty_ship >= qty_order THEN 48896
        ELSE 16777215 END),
    tooltip = (CASE
        WHEN qty_porder = 0 THEN 'Red .-  No Purchase Orders'
        WHEN qty_porder > 0 AND qty_porder < qty_order THEN 'LIGHT BLUE  .-  Qty Order > Qty POrder'
        WHEN qty_porder >= qty_order AND qty_ship = 0 THEN 'BLUE .-  Qty POrder >= Qty Order'
        WHEN qty_ship > 0 AND qty_ship < qty_order THEN 'LIGHT GREEN .-  Qty Ship < Qty Order'
        WHEN qty_ship >= qty_order THEN 'GREEN .-  Qty Ship >= Qty Order'
        ELSE 'WHITE .- Order not completed' END)
FROM @tablita
ORDER BY customer
