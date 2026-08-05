CREATE OR ALTER PROCEDURE [dbo].[sp_NC_invoice_automatic_charges_growers_in]
    @lccharge_uq varchar(8),
    @lcgrower    varchar(100) = '',
    @lnoffset    int          = 0,
    @lnlimit     int          = 50
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @lcsearch varchar(102) = '%' + RTRIM(@lcgrower) + '%';

    SELECT fag.unico,
           grower = RTRIM(fg.grower) + ' - ' + RTRIM(ISNULL(fg.farm, '')),
           fg.city,
           active = CASE WHEN fg.active = 1 THEN 'Yes' ELSE 'No' END
    FROM flower_invoice_automatic_charges_growers fag
    INNER JOIN flower_growers fg ON fag.grower_uq = fg.unico
    WHERE fag.charge_uq = @lccharge_uq
    AND RTRIM(fg.grower) + ' ' + RTRIM(ISNULL(fg.city, '')) LIKE @lcsearch
    ORDER BY fg.grower
    OFFSET @lnoffset ROWS FETCH NEXT @lnlimit ROWS ONLY;
END
