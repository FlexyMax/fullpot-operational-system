USE [fullpot]
GO
-- ============================================================================
-- Business Intelligence — Saved Pivot/Grid Configurations
-- Tabla: NC_bi_saved_configs
-- Creado: 2026-07-14
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.NC_bi_saved_configs', 'U') IS NOT NULL
    DROP TABLE dbo.NC_bi_saved_configs;
GO

CREATE TABLE dbo.NC_bi_saved_configs (
    unico       char(8)         NOT NULL PRIMARY KEY,
    user_uq     char(8)         NOT NULL,
    report_uq   char(8)         NOT NULL,
    name        varchar(100)    NOT NULL,
    config_json nvarchar(max)   NOT NULL,
    created_at  datetime        NOT NULL DEFAULT GETDATE(),
    updated_at  datetime        NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX IX_NC_bi_saved_configs_user_report
    ON dbo.NC_bi_saved_configs(user_uq, report_uq);
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_bi_configs_list', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_bi_configs_list;
GO

CREATE PROCEDURE [dbo].[sp_NC_bi_configs_list]
    @lcuser_uq   char(8),
    @lcreport_uq char(8) = NULL
AS
-- ================================================================
-- SP:    sp_NC_bi_configs_list
-- DB:    fullpot | Tabla: NC_bi_saved_configs
-- Desc:  Lista configuraciones guardadas de BI para un usuario.
--        Si @lcreport_uq no es NULL, filtra por reporte.
-- Historia: 2026-07-14  NC: Creado
-- ================================================================
SET NOCOUNT ON
SELECT unico, user_uq, report_uq, name, config_json, created_at, updated_at
FROM NC_bi_saved_configs
WHERE user_uq = @lcuser_uq
  AND (@lcreport_uq IS NULL OR report_uq = @lcreport_uq)
ORDER BY name, created_at
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_bi_configs_insert', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_bi_configs_insert;
GO

CREATE PROCEDURE [dbo].[sp_NC_bi_configs_insert]
    @lcuser_uq     char(8),
    @lcreport_uq   char(8),
    @lcname        varchar(100),
    @lcconfig_json nvarchar(max)
AS
-- ================================================================
-- SP:    sp_NC_bi_configs_insert
-- DB:    fullpot | Tabla: NC_bi_saved_configs
-- Desc:  Crea una nueva configuracion de cubo BI.
-- Retorna: unico = nuevo registro, message = resultado, error = 0/1
-- Historia: 2026-07-14  NC: Creado
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = '', @lcUnico char(8)
SET @lcUnico = LEFT(NEWID(), 8)
BEGIN TRY
    INSERT INTO NC_bi_saved_configs (unico, user_uq, report_uq, name, config_json)
    VALUES (@lcUnico, @lcuser_uq, @lcreport_uq, @lcname, @lcconfig_json)
    SET @lcMessage = 'Configuration saved.'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_bi_configs_update', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_bi_configs_update;
GO

CREATE PROCEDURE [dbo].[sp_NC_bi_configs_update]
    @lcunico       char(8),
    @lcuser_uq     char(8),
    @lcname        varchar(100),
    @lcconfig_json nvarchar(max)
AS
-- ================================================================
-- SP:    sp_NC_bi_configs_update
-- DB:    fullpot | Tabla: NC_bi_saved_configs
-- Desc:  Actualiza una configuracion de cubo BI. Valida propiedad.
-- Retorna: unico = registro actualizado, message = resultado, error = 0/1
-- Historia: 2026-07-14  NC: Creado
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
IF NOT EXISTS (SELECT 1 FROM NC_bi_saved_configs WHERE unico = @lcunico AND user_uq = @lcuser_uq)
BEGIN
    SELECT @lcMessage = 'Configuration not found or access denied.', @llerror = 1
END
BEGIN TRY
    IF @llerror = 0
    BEGIN
        UPDATE NC_bi_saved_configs
        SET name        = @lcname,
            config_json = @lcconfig_json,
            updated_at  = GETDATE()
        WHERE unico = @lcunico
          AND user_uq = @lcuser_uq
        SET @lcMessage = 'Configuration updated.'
    END
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcunico, message = @lcMessage, error = @llerror
GO

-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.sp_NC_bi_configs_delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NC_bi_configs_delete;
GO

CREATE PROCEDURE [dbo].[sp_NC_bi_configs_delete]
    @lcunico   char(8),
    @lcuser_uq char(8)
AS
-- ================================================================
-- SP:    sp_NC_bi_configs_delete
-- DB:    fullpot | Tabla: NC_bi_saved_configs
-- Desc:  Elimina una configuracion de cubo BI. Valida propiedad.
-- Retorna: unico = registro eliminado, message = resultado, error = 0/1
-- Historia: 2026-07-14  NC: Creado
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
IF NOT EXISTS (SELECT 1 FROM NC_bi_saved_configs WHERE unico = @lcunico AND user_uq = @lcuser_uq)
BEGIN
    SELECT @lcMessage = 'Configuration not found or access denied.', @llerror = 1
END
BEGIN TRY
    IF @llerror = 0
    BEGIN
        DELETE FROM NC_bi_saved_configs WHERE unico = @lcunico AND user_uq = @lcuser_uq
        SET @lcMessage = 'Configuration deleted.'
    END
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcunico, message = @lcMessage, error = @llerror
GO
