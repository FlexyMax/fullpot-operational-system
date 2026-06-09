USE [SISTEMA]
GO

-- =========================================================
-- MODULES SPs
-- =========================================================

IF OBJECT_ID('sp_sistema_modulos_insert') IS NOT NULL DROP PROCEDURE sp_sistema_modulos_insert;
GO
CREATE PROCEDURE sp_sistema_modulos_insert
    @lcUnico char(8),
    @lcNombre varchar(100),
    @lcClase varchar(50),
    @lnOrden int,
    @lcImage varchar(100),
    @lcDescripcion varchar(200),
    @llActive bit,
    @llWeb bit,
    @lcDsn varchar(50) = ''
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF ISNULL(@lcUnico,'') = '' SET @lcUnico = UPPER(SUBSTRING(REPLACE(CAST(NEWID() AS VARCHAR(36)),'-',''), 1, 8));

        INSERT INTO modulo (unico, nombre, clase, orden, image, descripcion, active, web, dsn, timestamp)
        VALUES (@lcUnico, @lcNombre, @lcClase, @lnOrden, @lcImage, @lcDescripcion, @llActive, @llWeb, @lcDsn, GETDATE());

        SELECT '' AS Error, 'Module created successfully.' AS Message, @lcUnico AS Unico;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to create module.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_modulos_update') IS NOT NULL DROP PROCEDURE sp_sistema_modulos_update;
GO
CREATE PROCEDURE sp_sistema_modulos_update
    @lcUnico char(8),
    @lcNombre varchar(100),
    @lcClase varchar(50),
    @lnOrden int,
    @lcImage varchar(100),
    @lcDescripcion varchar(200),
    @llActive bit,
    @llWeb bit,
    @lcDsn varchar(50) = ''
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE modulo 
        SET nombre = @lcNombre, 
            clase = @lcClase, 
            orden = @lnOrden, 
            image = @lcImage, 
            descripcion = @lcDescripcion, 
            active = @llActive, 
            web = @llWeb, 
            dsn = @lcDsn,
            timestamp = GETDATE()
        WHERE unico = @lcUnico;

        SELECT '' AS Error, 'Module updated successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to update module.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_modulos_delete') IS NOT NULL DROP PROCEDURE sp_sistema_modulos_delete;
GO
CREATE PROCEDURE sp_sistema_modulos_delete
    @lcUnico char(8)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if it has screens
        IF EXISTS (SELECT 1 FROM pantalla WHERE modulo_uq = @lcUnico)
        BEGIN
            SELECT 'Cannot delete module because it has screens attached.' AS Error, '' AS Message;
            RETURN;
        END

        DELETE FROM modulo WHERE unico = @lcUnico;
        SELECT '' AS Error, 'Module deleted successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to delete module.' AS Message;
    END CATCH
END
GO


-- =========================================================
-- SCREENS SPs
-- =========================================================

IF OBJECT_ID('sp_sistema_pantallas_insert') IS NOT NULL DROP PROCEDURE sp_sistema_pantallas_insert;
GO
CREATE PROCEDURE sp_sistema_pantallas_insert
    @lcUnico char(8),
    @lcModulo_uq char(8),
    @lcNombre varchar(100),
    @lnOrden int,
    @lcRun_pantalla varchar(100),
    @lcImage varchar(100),
    @lcPath varchar(200),
    @llMenu bit,
    @lcExecutable varchar(100),
    @lcWeb_form varchar(100),
    @lcDescripcion varchar(200)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF ISNULL(@lcUnico,'') = '' SET @lcUnico = UPPER(SUBSTRING(REPLACE(CAST(NEWID() AS VARCHAR(36)),'-',''), 1, 8));

        INSERT INTO pantalla (unico, modulo_uq, nombre, orden, run_pantalla, image, path, menu, executable, web_form, descripcion, timestamp)
        VALUES (@lcUnico, @lcModulo_uq, @lcNombre, @lnOrden, @lcRun_pantalla, @lcImage, @lcPath, @llMenu, @lcExecutable, @lcWeb_form, @lcDescripcion, GETDATE());

        SELECT '' AS Error, 'Screen created successfully.' AS Message, @lcUnico AS Unico;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to create screen.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_pantallas_update') IS NOT NULL DROP PROCEDURE sp_sistema_pantallas_update;
GO
CREATE PROCEDURE sp_sistema_pantallas_update
    @lcUnico char(8),
    @lcModulo_uq char(8),
    @lcNombre varchar(100),
    @lnOrden int,
    @lcRun_pantalla varchar(100),
    @lcImage varchar(100),
    @lcPath varchar(200),
    @llMenu bit,
    @lcExecutable varchar(100),
    @lcWeb_form varchar(100),
    @lcDescripcion varchar(200)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE pantalla 
        SET modulo_uq = @lcModulo_uq,
            nombre = @lcNombre,
            orden = @lnOrden,
            run_pantalla = @lcRun_pantalla,
            image = @lcImage,
            path = @lcPath,
            menu = @llMenu,
            executable = @lcExecutable,
            web_form = @lcWeb_form,
            descripcion = @lcDescripcion,
            timestamp = GETDATE()
        WHERE unico = @lcUnico;

        SELECT '' AS Error, 'Screen updated successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to update screen.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_pantallas_delete') IS NOT NULL DROP PROCEDURE sp_sistema_pantallas_delete;
GO
CREATE PROCEDURE sp_sistema_pantallas_delete
    @lcUnico char(8)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if it has reports
        IF EXISTS (SELECT 1 FROM pantalla_reportes WHERE panta_uq = @lcUnico)
        BEGIN
            SELECT 'Cannot delete screen because it has reports attached.' AS Error, '' AS Message;
            RETURN;
        END

        DELETE FROM pantalla WHERE unico = @lcUnico;
        SELECT '' AS Error, 'Screen deleted successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to delete screen.' AS Message;
    END CATCH
END
GO


-- =========================================================
-- REPORTS SPs
-- =========================================================

IF OBJECT_ID('sp_sistema_reportes_insert') IS NOT NULL DROP PROCEDURE sp_sistema_reportes_insert;
GO
CREATE PROCEDURE sp_sistema_reportes_insert
    @lcUnico char(8),
    @lcPanta_uq char(8),
    @lcNombre varchar(100),
    @lcTitulo varchar(100),
    @lcPath varchar(200),
    @lcDescripcion varchar(200),
    @llFecha_desde bit,
    @llFecha_hasta bit,
    @llNumero_desde bit,
    @llNumero_hasta bit,
    @llActual bit,
    @llComprimido bit,
    @llDetallado bit,
    @llExportar bit
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF ISNULL(@lcUnico,'') = '' SET @lcUnico = UPPER(SUBSTRING(REPLACE(CAST(NEWID() AS VARCHAR(36)),'-',''), 1, 8));

        INSERT INTO pantalla_reportes (unico, panta_uq, nombre, titulo, path, descripcion, fecha_desde, fecha_hasta, numero_desde, numero_hasta, actual, comprimido, detallado, exportar, timestamp)
        VALUES (@lcUnico, @lcPanta_uq, @lcNombre, @lcTitulo, @lcPath, @lcDescripcion, @llFecha_desde, @llFecha_hasta, @llNumero_desde, @llNumero_hasta, @llActual, @llComprimido, @llDetallado, @llExportar, GETDATE());

        SELECT '' AS Error, 'Report created successfully.' AS Message, @lcUnico AS Unico;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to create report.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_reportes_update') IS NOT NULL DROP PROCEDURE sp_sistema_reportes_update;
GO
CREATE PROCEDURE sp_sistema_reportes_update
    @lcUnico char(8),
    @lcPanta_uq char(8),
    @lcNombre varchar(100),
    @lcTitulo varchar(100),
    @lcPath varchar(200),
    @lcDescripcion varchar(200),
    @llFecha_desde bit,
    @llFecha_hasta bit,
    @llNumero_desde bit,
    @llNumero_hasta bit,
    @llActual bit,
    @llComprimido bit,
    @llDetallado bit,
    @llExportar bit
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE pantalla_reportes
        SET panta_uq = @lcPanta_uq,
            nombre = @lcNombre,
            titulo = @lcTitulo,
            path = @lcPath,
            descripcion = @lcDescripcion,
            fecha_desde = @llFecha_desde,
            fecha_hasta = @llFecha_hasta,
            numero_desde = @llNumero_desde,
            numero_hasta = @llNumero_hasta,
            actual = @llActual,
            comprimido = @llComprimido,
            detallado = @llDetallado,
            exportar = @llExportar,
            timestamp = GETDATE()
        WHERE unico = @lcUnico;

        SELECT '' AS Error, 'Report updated successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to update report.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_reportes_delete') IS NOT NULL DROP PROCEDURE sp_sistema_reportes_delete;
GO
CREATE PROCEDURE sp_sistema_reportes_delete
    @lcUnico char(8)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM pantalla_reportes WHERE unico = @lcUnico;
        SELECT '' AS Error, 'Report deleted successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to delete report.' AS Message;
    END CATCH
END
GO
