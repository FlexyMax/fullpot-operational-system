CREATE OR ALTER PROCEDURE [dbo].[sp_NC_customer_wphysical_list]
    @customer_uq char(8)
AS BEGIN
    SET NOCOUNT ON;
    SELECT
        cwp.unico,
        cwp.customer_uq,
        cwp.pw_uq,
        wp.wp_name
    FROM   flower_customers_wphysical cwp
    JOIN   flower_warehouses_physical wp  ON wp.unico = cwp.pw_uq
    WHERE  cwp.customer_uq = @customer_uq
    ORDER  BY wp.wp_name;
END
