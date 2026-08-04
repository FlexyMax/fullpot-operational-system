CREATE OR ALTER PROCEDURE [dbo].[sp_NC_accounts_income_update_ready_to_qbooks]
    @lcincome_uq     varchar(8),
    @llready         bit,
    @llByReadyByDate bit  = null,
    @ldin_date       date = null
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @llerror   bit          = 0;
    DECLARE @lcmessage varchar(1000) = '';

    BEGIN TRY
        IF @llByReadyByDate = 1
        BEGIN
            UPDATE flower_accounts_income
            SET    qb_ready = @llready,
                   qb_sent  = 0
            WHERE  CAST(in_date AS date) = @ldin_date
              AND  type_uq NOT IN ('F296D5AF');

            IF @@ROWCOUNT >= 1
            BEGIN
                SET @llerror   = 0;
                SET @lcmessage = 'Ready To QBooks By Date OK';
            END
            ELSE
            BEGIN
                SET @llerror   = 1;
                SET @lcmessage = 'Transaction ERROR';
            END
        END
        ELSE
        BEGIN
            UPDATE flower_accounts_income
            SET    qb_ready = @llready,
                   qb_sent  = 0
            WHERE  unico = @lcincome_uq
              AND  type_uq NOT IN ('F296D5AF');

            IF @@ROWCOUNT = 1
            BEGIN
                SET @llerror   = 0;
                SET @lcmessage = 'Ready To QBooks OK';
            END
            ELSE
            BEGIN
                SET @llerror   = 1;
                SET @lcmessage = 'Transaction ERROR';
            END
        END
    END TRY
    BEGIN CATCH
        SET @lcmessage = 'Error No: ' + LTRIM(STR(ERROR_NUMBER())) + ' Line No: ' + LTRIM(STR(ERROR_LINE())) + ': ' + ERROR_MESSAGE();
        SET @llerror   = 1;
    END CATCH

    SELECT @lcincome_uq AS unico, @lcmessage AS message, @llerror AS error;
END
