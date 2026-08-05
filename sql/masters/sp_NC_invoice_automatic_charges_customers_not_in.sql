CREATE OR ALTER PROCEDURE [dbo].[sp_NC_invoice_automatic_charges_customers_not_in]
    @lccharge_uq varchar(8),
    @lccustomer  varchar(100) = '',
    @lnoffset    int          = 0,
    @lnlimit     int          = 50
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @lcsearch varchar(102) = '%' + RTRIM(@lccustomer) + '%';

    SELECT fc.unico, fc.customer, fc.city, fc.state,
           active = CASE WHEN fc.active = 1 THEN 'Yes' ELSE 'No' END
    FROM flower_customers fc
    WHERE NOT EXISTS (
        SELECT 1 FROM flower_invoice_automatic_charges_customers
        WHERE charge_uq = @lccharge_uq AND customer_uq = fc.unico
    )
    AND fc.auto_charge = 1
    AND fc.active = 1
    AND RTRIM(fc.customer) + ' ' + RTRIM(ISNULL(fc.city, '')) LIKE @lcsearch
    ORDER BY fc.customer
    OFFSET @lnoffset ROWS FETCH NEXT @lnlimit ROWS ONLY;
END
