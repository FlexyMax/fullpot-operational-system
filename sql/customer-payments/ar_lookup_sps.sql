USE [fullpot]
GO
-- ============================================================================
-- Accounts Receivable — Lookup / Read-Only SPs (NC — New Code)
-- "NC" = New Code: estos SPs no existian en VFP, creados para reemplazar
-- raw SQL (executeQuery) en las rutas del web app.
-- Creados: 2026-06-30
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_flower_salesmen_lista') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_flower_salesmen_lista
GO
CREATE PROCEDURE [dbo].[sp_NC_flower_salesmen_lista]
AS
-- ================================================================
-- SP:    sp_NC_flower_salesmen_lista
-- DB:    fullpot | Tabla: flower_salesmen
-- Desc:  Lista de vendedores activos para dropdown/lookup en AR
--        Reemplaza raw SQL en /api/customer-payments/lookups/salesmen
-- Retorna: unico, salesman_name, salesman_sh  ORDER BY salesman_name
-- Historia: 2026-06-30  NC: Creado (no habia SP en VFP)
-- ================================================================
SET NOCOUNT ON
SELECT unico, salesman_name, salesman_sh
FROM flower_salesmen
WHERE active = 1
ORDER BY salesman_name
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_customer_email_update') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_customer_email_update
GO
CREATE PROCEDURE [dbo].[sp_NC_customer_email_update]
    @lcunico    char(8),
    @lcap_email varchar(200)
AS BEGIN
-- ================================================================
-- SP:    sp_NC_customer_email_update
-- DB:    fullpot | Tabla: flower_customers
-- Desc:  Actualiza ap_email de un cliente (usado desde Send All Statements)
-- Retorna: unico, Message, Error (NC_ uppercase pattern)
-- Historia: 2026-07-31  NC: Creado para reemplazar UPDATE raw en contact route
-- ================================================================
    SET NOCOUNT ON;
    DECLARE @llerror   bit           = 0;
    DECLARE @lcmessage varchar(1000) = '';

    UPDATE flower_customers SET ap_email = @lcap_email WHERE unico = @lcunico;

    IF @@ROWCOUNT >= 1 SET @lcmessage = 'Transaction OK';
    ELSE BEGIN SET @llerror = 1; SET @lcmessage = 'Customer not found'; END

    SELECT @lcunico AS unico, @lcmessage AS Message, @llerror AS Error;
END
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_flower_payment_history') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_flower_payment_history
GO
CREATE PROCEDURE [dbo].[sp_NC_flower_payment_history]
    @lccustomer_uq char(8)
AS
-- ================================================================
-- SP:    sp_NC_flower_payment_history
-- DB:    fullpot | Tabla: flower_accounts_income
-- Desc:  Historial de pagos de un cliente (tab Payment History en AR)
--        Reemplaza raw SQL con inyeccion SQL potencial en:
--        /api/customer-payments/payment-history/[customer_uq]
-- Params: @lccustomer_uq char(8) — unico del cliente
-- Retorna: todos los pagos del cliente ORDER BY in_date DESC
-- Historia: 2026-06-30  NC: Creado (reemplaza executeQuery raw SQL)
-- ================================================================
SET NOCOUNT ON
SELECT unico, automatic, type_uq, in_date, bank_uq, customer_uq,
       in_ammount, in_total, in_balance, card, credit_card_no,
       approval, exp_month, exp_year, details, bank_doc,
       deposit, void, void_date
FROM flower_accounts_income
WHERE customer_uq = @lccustomer_uq
ORDER BY in_date DESC, identity_column DESC
GO
