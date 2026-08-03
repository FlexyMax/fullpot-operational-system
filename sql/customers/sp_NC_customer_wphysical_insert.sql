CREATE OR ALTER PROCEDURE [dbo].[sp_NC_customer_wphysical_insert]
    @customer_uq char(8),
    @pw_uq       char(8)
AS BEGIN
    SET NOCOUNT ON;
    DECLARE @lcunico   char(8)       = LEFT(NEWID(), 8);
    DECLARE @llerror   bit           = 0;
    DECLARE @lcmessage varchar(1000) = '';

    IF NOT EXISTS (
        SELECT 1 FROM flower_customers_wphysical
        WHERE customer_uq = @customer_uq AND pw_uq = @pw_uq
    )
    BEGIN
        INSERT INTO flower_customers_wphysical (unico, customer_uq, pw_uq, timestamp)
        VALUES (@lcunico, @customer_uq, @pw_uq, GETDATE());

        IF @@ROWCOUNT >= 1 SET @lcmessage = 'Transaction OK';
        ELSE BEGIN SET @llerror = 1; SET @lcmessage = 'SQL command error, try again'; END
    END
    ELSE BEGIN
        SET @llerror   = 1;
        SET @lcmessage = 'This store is already assigned to this customer';
    END

    SELECT @lcunico AS unico, @lcmessage AS Message, @llerror AS Error;
END
