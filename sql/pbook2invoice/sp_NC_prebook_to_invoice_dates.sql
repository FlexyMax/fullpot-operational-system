CREATE PROCEDURE [dbo].[sp_NC_prebook_to_invoice_dates]
    @llpb_date bit = 1     -- 1 = Delivery (group by flower_prebook.pb_date), 0 = Arrival/Shipping (group by flower_prebook.whouse_date)
AS
-- ============================================================================
-- sp_NC_prebook_to_invoice_dates
-- "NC" = New Code / web app version, created 2026-06-30. Replaces, for the
-- web app's Prebook to Invoice > Date Picker grid, the two legacy VFP procs:
--   sp_flower_prebook_to_invoice_dates           (delivery / pb_date)
--   sp_flower_prebook_to_invoice_dates_shipping  (arrival  / whouse_date)
-- Both legacy procs are left untouched and still used by the VFP desktop app.
--
-- v3: calls dbo.udf_NC_prebook_box_purchase_control(@from, @to, @llpb_date) —
-- the parameterized v2 of the lean NC function — instead of filtering an
-- unfiltered call afterward. Passing the date range INTO the function lets
-- it pre-filter the prebook_box set before joining the invoice history
-- (see that function's header comment for why that join was the real
-- bottleneck: ~2.7s on its own, unfiltered). Net result measured live:
-- legacy proc ~3.5s -> this version ~0.9s for the same -15-day window.
-- ============================================================================
SET NOCOUNT ON

DECLARE @lnview_days int = -15            -- same window as the legacy procs: today and 15 days back
DECLARE @ldfrom date = DATEADD(day, @lnview_days, CAST(GETDATE() AS date))
DECLARE @ldto   date = '2099-12-31'       -- legacy procs have no upper bound either; this is effectively "no cap"

DECLARE @tablita TABLE (
    pb_date         datetime,
    pbdate          varchar(12),
    records         int,
    qty_order       int,
    qty_porder      numeric(10,2),
    qty_invoice     numeric(10,2),
    total_sale      numeric(12,2),
    total_purchase  numeric(12,2),
    qty_ship        numeric(10,2)
)

IF @llpb_date = 1
BEGIN
    -- Delivery mode: group by flower_prebook.pb_date
    ;WITH counts AS (
        -- how many closed prebooks per delivery date
        SELECT
            CONVERT(datetime, CONVERT(char(12), pb_date)) AS pb_date,
            CONVERT(char(12), pb_date) AS pbdate,
            COUNT(unico) AS records
        FROM flower_prebook
        WHERE pb_date >= @ldfrom AND pb_date < DATEADD(day, 1, @ldto)
          AND closed = 1
        GROUP BY CONVERT(datetime, CONVERT(char(12), pb_date)), CONVERT(char(12), pb_date)
    ),
    sums AS (
        -- box/purchase/sale/cost totals per delivery date, from the lean
        -- NC purchase-control function, pre-filtered to the same window
        SELECT
            pb_date,
            pbdate,
            SUM(qty_order)      AS qty_order,
            SUM(po_cases)       AS qty_porder,
            SUM(invoiced_cases) AS qty_invoice,
            SUM(total_sales)    AS total_sale,
            SUM(poflower_cost)  AS total_purchase,   -- flower-only cost (matches legacy sp_flower_prebook_to_invoice_dates)
            SUM(ship_cases)     AS qty_ship
        FROM dbo.udf_NC_prebook_box_purchase_control(@ldfrom, @ldto, 1)
        GROUP BY pb_date, pbdate
    )
    INSERT INTO @tablita (pb_date, pbdate, records, qty_order, qty_porder, qty_invoice, total_sale, total_purchase, qty_ship)
    SELECT
        COALESCE(c.pb_date, s.pb_date),
        COALESCE(c.pbdate, s.pbdate),
        ISNULL(c.records, 0),
        ISNULL(s.qty_order, 0),
        ISNULL(s.qty_porder, 0),
        ISNULL(s.qty_invoice, 0),
        ISNULL(s.total_sale, 0),
        ISNULL(s.total_purchase, 0),
        ISNULL(s.qty_ship, 0)
    FROM counts c
    FULL OUTER JOIN sums s ON s.pb_date = c.pb_date
    OPTION (RECOMPILE)   -- @ldfrom/@ldto are local variables, not the proc's own params — without
                         -- this, SQL Server can't see their actual value at compile time and
                         -- mis-estimates the udf_NC_prebook_box_purchase_control() join badly
                         -- (measured: ~4.2s without RECOMPILE vs ~0.9s with it)
END
ELSE
BEGIN
    -- Arrival/shipping mode: identical shape, grouped by flower_prebook.whouse_date instead
    ;WITH counts AS (
        SELECT
            CONVERT(datetime, CONVERT(char(12), whouse_date)) AS whouse_date,
            CONVERT(char(12), whouse_date) AS whousedate,
            COUNT(unico) AS records
        FROM flower_prebook
        WHERE whouse_date >= @ldfrom AND whouse_date < DATEADD(day, 1, @ldto)
          AND closed = 1
        GROUP BY CONVERT(datetime, CONVERT(char(12), whouse_date)), CONVERT(char(12), whouse_date)
    ),
    sums AS (
        SELECT
            whouse_date,
            shipdate,
            SUM(qty_order)      AS qty_order,
            SUM(po_cases)       AS qty_porder,
            SUM(invoiced_cases) AS qty_invoice,
            SUM(total_sales)    AS total_sale,
            SUM(poflower_cost)  AS total_purchase,
            SUM(ship_cases)     AS qty_ship
        FROM dbo.udf_NC_prebook_box_purchase_control(@ldfrom, @ldto, 0)
        GROUP BY whouse_date, shipdate
    )
    INSERT INTO @tablita (pb_date, pbdate, records, qty_order, qty_porder, qty_invoice, total_sale, total_purchase, qty_ship)
    SELECT
        COALESCE(c.whouse_date, s.whouse_date),
        COALESCE(c.whousedate, s.shipdate),
        ISNULL(c.records, 0),
        ISNULL(s.qty_order, 0),
        ISNULL(s.qty_porder, 0),
        ISNULL(s.qty_invoice, 0),
        ISNULL(s.total_sale, 0),
        ISNULL(s.total_purchase, 0),
        ISNULL(s.qty_ship, 0)
    FROM counts c
    FULL OUTER JOIN sums s ON s.whouse_date = c.whouse_date
    OPTION (RECOMPILE)
END

-- Final shape matches the legacy procs exactly (pb_date/pbdate column names
-- are reused for both modes — the web app already reads pb_date as the
-- generic date column regardless of which mode requested it).
SELECT
    pb_date,
    pbdate,
    records,
    qty_order,
    qty_porder,
    qty_invoice,
    qty_ship,
    total_sale,
    total_purchase,
    profit = CASE WHEN total_sale > 0 THEN (total_sale - total_purchase) * 100 / total_sale ELSE 0 END,
    -- color/tooltip: identical traffic-light logic to the legacy procs
    -- (red = no purchase orders yet ... green = fully shipped)
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
ORDER BY pb_date DESC
