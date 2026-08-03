CREATE OR ALTER PROCEDURE [dbo].[sp_NC_customer_wphysical_delete]
    @unico char(8)
AS BEGIN
    SET NOCOUNT ON;
    DECLARE @lcunico   char(8)       = @unico;
    DECLARE @llerror   bit           = 0;
    DECLARE @lcmessage varchar(1000) = '';

    DELETE FROM flower_customers_wphysical WHERE unico = @unico;

    IF @@ROWCOUNT >= 1 SET @lcmessage = 'Transaction OK';
    ELSE BEGIN SET @llerror = 1; SET @lcmessage = 'SQL command error, try again'; END

    SELECT @lcunico AS unico, @lcmessage AS Message, @llerror AS Error;
END
