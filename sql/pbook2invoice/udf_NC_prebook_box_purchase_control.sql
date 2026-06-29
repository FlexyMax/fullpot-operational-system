CREATE FUNCTION [dbo].[udf_NC_prebook_box_purchase_control]
(
    @lddatefrom date,   -- inclusive lower bound on the chosen date field
    @lddateto   date,   -- inclusive upper bound on the chosen date field
    @llpb_date  bit      -- 1 = filter by flower_prebook.pb_date, 0 = filter by flower_prebook.whouse_date
)
-- ============================================================================
-- udf_NC_prebook_box_purchase_control (v2 — now parameterized)
-- "NC" = New Code / web app version, created 2026-06-30. Used only by:
--   sp_NC_prebook_to_invoice_dates
--   sp_NC_prebook_customers_by_date_closed
-- The legacy dbo.udf_flower_prebook_box_purchase_control() is left completely
-- untouched and still used by the VFP desktop app and every other proc that
-- already calls it.
--
-- v1 of this function (no parameters, same 3 joins as below but plain
-- dbo.udf_flower_prebook_box_in_invoice() with no filter) measured NO faster
-- than the legacy function — bisecting column by column found the entire
-- cost concentrated in one join: invoiced_cases alone took ~2.7s, because
-- udf_flower_prebook_box_in_invoice() aggregates flower_invoice/
-- flower_invoice_box (the company's ENTIRE invoice history, no date filter)
-- before being LEFT JOINed — the caller's date filter never reaches it.
--
-- v2 takes the date range as parameters, builds the qualifying prebook_box
-- set ONCE as the `boxes` CTE, and inlines the invoice aggregation with an
-- explicit `pbook_d_uq IN (SELECT unico FROM boxes)` filter so it only
-- aggregates invoice lines that can possibly match — not the whole table.
-- compras/shipped (udf_flower_prebook_box_purchase/_shipped) are left as
-- plain unfiltered joins, same as v1 — bisecting showed those two resolve in
-- well under a second on their own, they were never the bottleneck.
-- ============================================================================
RETURNS TABLE AS
RETURN (
    WITH boxes AS (
        SELECT
            flower_prebook_box.unico,
            flower_prebook_box.pbook_uq,
            flower_prebook_box.qty_order,
            flower_prebook_box.packs_x_case,
            flower_prebook_box.up_x_pack,
            flower_prebook_box.ext_price,
            flower_prebook.customer_uq,
            flower_prebook.closed,
            convert(datetime, convert(char(12), flower_prebook.pb_date)) as pb_date,
            convert(datetime, convert(char(12), flower_prebook.whouse_date)) as whouse_date,
            convert(char(12), flower_prebook.pb_date) as pbdate,
            convert(char(12), flower_prebook.whouse_date) as shipdate
        FROM flower_prebook_box
        INNER JOIN flower_prebook ON flower_prebook_box.pbook_uq = flower_prebook.unico
        WHERE flower_prebook.closed = 1
          AND flower_prebook_box.packs_x_case > 0
          AND (
                (@llpb_date = 1 AND flower_prebook.pb_date     >= @lddatefrom AND flower_prebook.pb_date     < DATEADD(day, 1, @lddateto))
             OR (@llpb_date = 0 AND flower_prebook.whouse_date >= @lddatefrom AND flower_prebook.whouse_date < DATEADD(day, 1, @lddateto))
          )
    )
    SELECT
        boxes.unico,
        boxes.pbook_uq,
        boxes.customer_uq,
        boxes.closed,
        boxes.pb_date,
        boxes.whouse_date,
        boxes.pbdate,
        boxes.shipdate,
        boxes.qty_order,
        total_sales = boxes.ext_price,

        po_cases = case when boxes.packs_x_case * boxes.up_x_pack > 0
            then convert(numeric(10,2), isnull(compras.pototal_units * 1.00,0) / (boxes.packs_x_case * boxes.up_x_pack))
            else 0 end,
        po_cost = isnull(compras.pototal_cost,0),
        poflower_cost = convert(numeric(10,2), isnull(compras.poflower_cost,0)),

        ship_cases = case when boxes.packs_x_case * boxes.up_x_pack > 0
            then convert(numeric(10,2), isnull(shipped.ship_stems * 1.00,0) / (boxes.packs_x_case * boxes.up_x_pack))
            else 0 end,

        invoiced_cases = case when isnull(invoice.invoiced_stems,0) > 0
            then convert(numeric(10,2), isnull(invoice.invoiced_stems,0) / (boxes.packs_x_case * boxes.up_x_pack))
            else 0 end

    FROM boxes
    LEFT OUTER JOIN (
        SELECT pbook_d_uq, pototal_units, poflower_cost, pototal_cost
        FROM dbo.udf_flower_prebook_box_purchase()
    ) AS compras ON compras.pbook_d_uq = boxes.unico

    LEFT OUTER JOIN (
        SELECT pbook_d_uq, ship_stems
        FROM dbo.udf_flower_prebook_box_shipped()
    ) AS shipped ON shipped.pbook_d_uq = boxes.unico

    LEFT OUTER JOIN (
        -- inlined from udf_flower_prebook_box_in_invoice(), with the IN
        -- filter that makes this fast (see header comment above)
        SELECT flower_invoice_box.pbook_d_uq,
            SUM(flower_invoice_box.box_qty * flower_packing_box.packs_box * flower_packing_box.up_x_pack) as invoiced_stems
        FROM flower_invoice
        INNER JOIN flower_invoice_box ON flower_invoice.unico = flower_invoice_box.invoice_uq
        INNER JOIN flower_packing_stock ON flower_invoice_box.pk_sto_uq = flower_packing_stock.unico
        INNER JOIN flower_packing_box ON flower_packing_stock.pk_box_uq = flower_packing_box.unico
        WHERE flower_invoice.void = 0
          AND flower_invoice_box.pbook_d_uq IN (SELECT unico FROM boxes)
        GROUP BY flower_invoice_box.pbook_d_uq
    ) AS invoice ON invoice.pbook_d_uq = boxes.unico
)
