USE [fullpot]
GO
-- ============================================================================
-- Accounts Receivable — Corporate Income SPs
-- Tablas: flower_accounts_income_corp, flower_accounts_income,
--         flower_accounts_income_details
-- Modificado: 2026-06-30 NC — TRY/CATCH + OUTPUT unico + SELECT estandar
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_corporate_income_insert') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_corporate_income_insert
GO
CREATE PROCEDURE [dbo].[sp_flower_corporate_income_insert]
    @customer_uq char(8),
    @bank_doc    char(12),
    @pay_amount  numeric(10,2),
    @pay_date    datetime
AS
-- ================================================================
-- SP:    sp_flower_corporate_income_insert
-- DB:    fullpot | Tabla: flower_accounts_income_corp
-- Desc:  Inserta un pago corporativo. El tipo de transaccion se
--        toma automaticamente de flower_definitions.cor_type_uq.
--        El unico se genera via DEFAULT (left(newid(),8)).
-- Retorna: unico = nuevo registro, message = resultado, error = 0/1
-- Historia: (legacy VFP migration)
--           2026-06-30  NC: TRY/CATCH, OUTPUT unico, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = '', @lcUnico char(8), @type_uq char(8)
BEGIN TRY
    SELECT @type_uq = cor_type_uq FROM flower_definitions
    DECLARE @out TABLE (unico char(8))
    INSERT dbo.flower_accounts_income_corp (customer_uq, bank_doc, pay_amount, type_uq, pay_date)
    OUTPUT INSERTED.unico INTO @out
    VALUES (@customer_uq, @bank_doc, @pay_amount, @type_uq, @pay_date)
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
IF OBJECT_ID('dbo.sp_flower_corporate_income_update') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_corporate_income_update
GO
CREATE PROCEDURE [dbo].[sp_flower_corporate_income_update]
    @unico      char(8),
    @bank_doc   numeric(8,0),
    @pay_amount numeric(10,2),
    @pay_date   datetime
AS
-- ================================================================
-- SP:    sp_flower_corporate_income_update
-- DB:    fullpot | Tabla: flower_accounts_income_corp
-- Desc:  Actualiza un pago corporativo
-- Nota:  @bank_doc es numeric(8,0) en la BD (no char)
-- Retorna: unico = registro actualizado, message = resultado, error = 0/1
-- Historia: (legacy VFP migration)
--           2026-06-30  NC: TRY/CATCH, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
BEGIN TRY
    UPDATE dbo.flower_accounts_income_corp
    SET bank_doc = @bank_doc, pay_amount = @pay_amount, pay_date = @pay_date
    WHERE unico = @unico
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @unico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_corporate_income_delete') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_corporate_income_delete
GO
CREATE PROCEDURE [dbo].[sp_flower_corporate_income_delete]
    @unico char(8)
AS
-- ================================================================
-- SP:    sp_flower_corporate_income_delete
-- DB:    fullpot | Tabla: flower_accounts_income_corp
-- Desc:  Elimina un pago corporativo
-- Retorna: unico = registro eliminado, message = resultado, error = 0/1
-- Historia: (legacy VFP migration)
--           2026-06-30  NC: TRY/CATCH, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
BEGIN TRY
    DELETE dbo.flower_accounts_income_corp WHERE unico = @unico
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @unico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_flower_corporate_income_invoice_insert') IS NOT NULL
    DROP PROCEDURE dbo.sp_flower_corporate_income_invoice_insert
GO
CREATE PROCEDURE [dbo].[sp_flower_corporate_income_invoice_insert]
    @type_uq     char(8),
    @in_date     datetime,
    @customer_uq char(8),
    @in_amount   numeric(10,2),
    @bank_doc    char(12),
    @in_corp_uq  char(8),
    @acc_recd_uq char(8)
AS
-- ================================================================
-- SP:    sp_flower_corporate_income_invoice_insert
-- DB:    fullpot | Tablas: flower_accounts_income, flower_accounts_income_details
-- Desc:  Aplica un pago corporativo a una factura. Logica:
--        - Si ya existe income para corp+customer: suma el monto (UPDATE)
--        - Si no existe: inserta nuevo income (INSERT)
--        - Siempre inserta el detalle de aplicacion en income_details
-- Retorna: unico = income_uq, message = resultado, error = 0/1
-- Historia: (legacy VFP migration)
--           2026-06-30  NC: TRY/CATCH, SELECT estandar
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = '', @income_uq char(8)
BEGIN TRY
    IF EXISTS(SELECT * FROM dbo.flower_accounts_income WHERE in_corp_uq = @in_corp_uq AND customer_uq = @customer_uq)
    BEGIN
        UPDATE dbo.flower_accounts_income
        SET in_ammount = in_ammount + @in_amount, timestamp = getdate()
        WHERE in_corp_uq = @in_corp_uq AND customer_uq = @customer_uq
    END
    ELSE
    BEGIN
        INSERT dbo.flower_accounts_income (automatic, type_uq, in_date, customer_uq, in_ammount, bank_doc, in_corp_uq)
        VALUES (1, @type_uq, @in_date, @customer_uq, @in_amount, @bank_doc, @in_corp_uq)
    END
    SELECT @income_uq = unico FROM dbo.flower_accounts_income
    WHERE in_corp_uq = @in_corp_uq AND customer_uq = @customer_uq
    INSERT dbo.flower_accounts_income_details (in_ammount, acc_recd_uq, income_uq)
    VALUES (@in_amount, @acc_recd_uq, @income_uq)
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @income_uq, message = @lcMessage, error = @llerror
GO
