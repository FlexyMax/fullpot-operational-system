USE [fullpot]
GO
-- ============================================================================
-- Accounts Receivable — Payment Application Detail SPs
-- Tablas: flower_accounts_income_details
-- Modificado: 2026-06-30 NC — TRY/CATCH + OUTPUT unico + SELECT estandar
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_accounts_income_details_insert') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_accounts_income_details_insert
GO
CREATE PROCEDURE [dbo].[sp_flower_accounts_income_details_insert]
    @lcIncome_uq   char(8),
    @lcAcc_recd_uq char(8),
    @lnIn_ammount  numeric(10,2)
AS
-- ================================================================
-- SP:    sp_flower_accounts_income_details_insert
-- DB:    fullpot | Tabla: flower_accounts_income_details
-- Desc:  Inserta detalle de aplicacion de pago (aplica pago a factura)
-- Retorna: unico = nuevo registro, message = resultado, error = 0/1
-- Historia: 2004-03-07  Creado (migration VFP legacy)
--           2026-06-30  NC: TRY/CATCH, OUTPUT unico, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = '', @lcUnico char(8)
BEGIN TRY
    DECLARE @out TABLE (unico char(8))
    INSERT INTO flower_accounts_income_details (Income_uq, Acc_recd_uq, In_ammount)
    OUTPUT INSERTED.unico INTO @out
    VALUES (@lcIncome_uq, @lcAcc_recd_uq, @lnIn_ammount)
    SELECT @lcUnico = unico FROM @out
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_accounts_income_details_update') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_accounts_income_details_update
GO
CREATE PROCEDURE [dbo].[sp_flower_accounts_income_details_update]
    @lcUnico      char(8),
    @lnIn_ammount numeric(10,2)
AS
-- ================================================================
-- SP:    sp_flower_accounts_income_details_update
-- DB:    fullpot | Tabla: flower_accounts_income_details
-- Desc:  Actualiza el monto de un detalle de aplicacion de pago
-- Retorna: unico = registro actualizado, message = resultado, error = 0/1
-- Historia: 2004-03-07  Creado (migration VFP legacy)
--           2026-06-30  NC: TRY/CATCH, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
BEGIN TRY
    UPDATE flower_accounts_income_details SET In_ammount = @lnIn_ammount WHERE unico = @lcUnico
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_accounts_income_details_delete') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_accounts_income_details_delete
GO
CREATE PROCEDURE [dbo].[sp_flower_accounts_income_details_delete]
    @lcUnico char(8)
AS
-- ================================================================
-- SP:    sp_flower_accounts_income_details_delete
-- DB:    fullpot | Tabla: flower_accounts_income_details
-- Desc:  Elimina un detalle de aplicacion de pago
-- Retorna: unico = registro eliminado, message = resultado, error = 0/1
-- Historia: 2004-03-07  Creado (migration VFP legacy)
--           2026-06-30  NC: TRY/CATCH, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
BEGIN TRY
    DELETE FROM flower_accounts_income_details WHERE unico = @lcUnico
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_accounts_rec_x_income_insert') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_accounts_rec_x_income_insert
GO
CREATE PROCEDURE [dbo].[sp_flower_accounts_rec_x_income_insert]
    @lnIn_Amount   numeric(10,2),
    @lcAcc_recd_uq char(8),
    @lcIncome_uq   char(8)
AS
-- ================================================================
-- SP:    sp_flower_accounts_rec_x_income_insert
-- DB:    fullpot | Tabla: flower_accounts_income_details
-- Desc:  Aplica un monto de pago a una factura (usado por Pay All).
--        Valida parametros antes de insertar. Se llama en loop
--        desde el route /api/customer-payments/pay-all.
-- Retorna: unico = nuevo detalle, message = resultado, error = 0/1
-- Historia: (legacy VFP migration)
--           2026-06-30  NC: Inicializa @llerror=0, OUTPUT unico,
--                           SELECT estandar, valida con error=1
-- ================================================================
SET NOCOUNT ON
DECLARE @lcMessage varchar(1000) = '', @llerror bit = 0, @lcUnico char(8)
BEGIN TRY
    IF @lnIn_Amount > 0 AND @lcAcc_recd_uq IS NOT NULL AND @lcIncome_uq IS NOT NULL
    BEGIN
        DECLARE @out TABLE (unico char(8))
        INSERT INTO flower_accounts_income_details (in_ammount, acc_recd_uq, income_uq)
        OUTPUT INSERTED.unico INTO @out
        VALUES (@lnIn_Amount, @lcAcc_recd_uq, @lcIncome_uq)
        SELECT @lcUnico = unico FROM @out
        SET @lcMessage = 'Transaction OK'
    END
    ELSE
    BEGIN
        SET @llerror = 1
        IF @lnIn_Amount = 0
            SET @lcMessage = 'Please enter a payment amount greater than zero.'
        ELSE IF @lcAcc_recd_uq IS NULL
            SET @lcMessage = 'Please insert a valid invoice'
        ELSE
            SET @lcMessage = 'Please insert a valid Payment'
    END
END TRY
BEGIN CATCH
    SET @llerror = 1
    SET @lcMessage = 'An error occurred while inserting the payment. Please try again.'
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO
