-- sp_NC_porders_by_grower
-- Shows all confirmed PO lines for a grower + date regardless of dispatch status.
-- Replaces sp_flower_porders_by_grower (which hides already-dispatched orders).
-- Pass @grower_uq = '%' to return all growers in one call (used for the "ALL" card).
CREATE PROCEDURE [dbo].[sp_NC_porders_by_grower]
    @grower_uq  char(8),
    @date       datetime
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        flower_growers.farm,
        porder          = flower_prebook.pbook_no,
        flower_prebook.sorder_no,
        po_date         = CONVERT(char(12), flower_prebook_box_porder.po_date),
        ship_date       = CONVERT(char(12), flower_prebook_box_porder.ship_date),
        customer        = flower_customers.cust_code,
        case_name       = flower_cases.case_sh,
        pack            = LTRIM(STR(flower_prebook_box.packs_x_case)) + ' X ' + LTRIM(STR(flower_prebook_box.up_x_pack)),
        flower_products.description,
        flower_prebook_box_porder.tunits_x_box,
        flower_prebook_box_porder.total_units,
        flower_prebook_box_porder.qty_porder,
        flower_prebook_box_porder.qty_confirm,
        flower_prebook_box_porder.qty_diff,
        flower_prebook_box_porder.qty_ship,
        flower_prebook_box_porder.po_price,
        flower_prebook_box.so_price,
        flower_prebook_box_porder.awbcode,
        flower_prebook_box_porder.food,
        flower_prebook_box_porder.pccode,
        flower_prebook_box_porder.upc,
        flower_prebook_box_porder.cpo_number,
        flower_growers.grower,
        porder_uq       = flower_prebook_box_porder.unico,
        flower_prebook_box_porder.grower_uq,
        dispatched      = CASE WHEN flower_prebook_box_porder.unico IN (
                                SELECT ISNULL(porder_uq, '') FROM dbo.flower_packing_box
                            ) THEN 1 ELSE 0 END
    FROM         dbo.flower_prebook_box
    INNER JOIN   dbo.flower_prebook_box_porder  ON dbo.flower_prebook_box.unico           = dbo.flower_prebook_box_porder.pbook_d_uq
    INNER JOIN   dbo.flower_prebook             ON dbo.flower_prebook_box.pbook_uq         = dbo.flower_prebook.unico
    INNER JOIN   dbo.flower_customers           ON dbo.flower_prebook.customer_uq           = dbo.flower_customers.unico
    INNER JOIN   dbo.flower_growers             ON dbo.flower_prebook_box_porder.grower_uq  = dbo.flower_growers.unico
    INNER JOIN   dbo.flower_products            ON dbo.flower_prebook_box_porder.product_uq = dbo.flower_products.unico
    INNER JOIN   dbo.flower_cases               ON dbo.flower_prebook_box_porder.case_uq    = dbo.flower_cases.unico
    WHERE  DATEDIFF(day, dbo.flower_prebook_box_porder.ship_date, @date) = 0
      AND  dbo.flower_prebook_box_porder.qty_confirm > 0
      AND  dbo.flower_growers.unico LIKE RTRIM(@grower_uq)
    ORDER BY dbo.flower_growers.grower, dbo.flower_prebook.pbook_no, dbo.flower_products.description;
END
