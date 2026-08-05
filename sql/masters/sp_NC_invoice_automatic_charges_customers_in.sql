CREATE OR ALTER PROCEDURE [dbo].[sp_NC_invoice_automatic_charges_customers_in]
    @lccharge_uq varchar(8),
    @lccustomer  varchar(100) = '',
    @lnoffset    int          = 0,
    @lnlimit     int          = 50
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @lcsearch varchar(102) = '%' + RTRIM(@lccustomer) + '%';

    SELECT fac.unico, fc.customer, fc.city, fc.state,
           active = CASE WHEN fc.active = 1 THEN 'Yes' ELSE 'No' END
    FROM flower_invoice_automatic_charges_customers fac
    INNER JOIN flower_customers fc ON fac.customer_uq = fc.unico
    WHERE fac.charge_uq = @lccharge_uq
    AND RTRIM(fc.customer) + ' ' + RTRIM(ISNULL(fc.city, '')) LIKE @lcsearch
    ORDER BY fc.customer
    OFFSET @lnoffset ROWS FETCH NEXT @lnlimit ROWS ONLY;
END
