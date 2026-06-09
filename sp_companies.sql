USE [SISTEMA]
GO

-- =========================================================
-- COMPANIES SPs (empresas table)
-- =========================================================

IF OBJECT_ID('sp_sistema_empresas_insert') IS NOT NULL DROP PROCEDURE sp_sistema_empresas_insert;
GO
CREATE PROCEDURE sp_sistema_empresas_insert
    @lcUnico char(8),
    @lcRuc varchar(50),
    @lcNombre varchar(150),
    @lcPais varchar(50),
    @lcCiudad varchar(50),
    @lcDireccion varchar(200),
    @lcTelefono1 varchar(50),
    @lcTelefono2 varchar(50),
    @lcFax1 varchar(50),
    @lcFax2 varchar(50),
    @lcApostal varchar(50),
    @lcEmail varchar(150),
    @lcImage varchar(250),
    @lcBasedatos varchar(50),
    @lcDatapath varchar(200),
    @lcServidor varchar(100),
    @lcDsn varchar(50),
    @llActive bit,
    @lcWebsite varchar(150)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF ISNULL(@lcUnico,'') = '' SET @lcUnico = UPPER(SUBSTRING(REPLACE(CAST(NEWID() AS VARCHAR(36)),'-',''), 1, 8));

        INSERT INTO empresas (
            unico, ruc, nombre, pais, ciudad, direccion, telefono1, telefono2,
            fax1, fax2, apostal, email, image, basedatos, datapath,
            servidor, dsn, active, website, timestamp
        )
        VALUES (
            @lcUnico, @lcRuc, @lcNombre, @lcPais, @lcCiudad, @lcDireccion, @lcTelefono1, @lcTelefono2,
            @lcFax1, @lcFax2, @lcApostal, @lcEmail, @lcImage, @lcBasedatos, @lcDatapath,
            @lcServidor, @lcDsn, @llActive, @lcWebsite, GETDATE()
        );

        SELECT '' AS Error, 'Company created successfully.' AS Message, @lcUnico AS Unico;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to create company.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_empresas_update') IS NOT NULL DROP PROCEDURE sp_sistema_empresas_update;
GO
CREATE PROCEDURE sp_sistema_empresas_update
    @lcUnico char(8),
    @lcRuc varchar(50),
    @lcNombre varchar(150),
    @lcPais varchar(50),
    @lcCiudad varchar(50),
    @lcDireccion varchar(200),
    @lcTelefono1 varchar(50),
    @lcTelefono2 varchar(50),
    @lcFax1 varchar(50),
    @lcFax2 varchar(50),
    @lcApostal varchar(50),
    @lcEmail varchar(150),
    @lcImage varchar(250),
    @lcBasedatos varchar(50),
    @lcDatapath varchar(200),
    @lcServidor varchar(100),
    @lcDsn varchar(50),
    @llActive bit,
    @lcWebsite varchar(150)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE empresas
        SET ruc = @lcRuc,
            nombre = @lcNombre,
            pais = @lcPais,
            ciudad = @lcCiudad,
            direccion = @lcDireccion,
            telefono1 = @lcTelefono1,
            telefono2 = @lcTelefono2,
            fax1 = @lcFax1,
            fax2 = @lcFax2,
            apostal = @lcApostal,
            email = @lcEmail,
            image = @lcImage,
            basedatos = @lcBasedatos,
            datapath = @lcDatapath,
            servidor = @lcServidor,
            dsn = @lcDsn,
            active = @llActive,
            website = @lcWebsite,
            timestamp = GETDATE()
        WHERE unico = @lcUnico;

        SELECT '' AS Error, 'Company updated successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to update company.' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_sistema_empresas_delete') IS NOT NULL DROP PROCEDURE sp_sistema_empresas_delete;
GO
CREATE PROCEDURE sp_sistema_empresas_delete
    @lcUnico char(8)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if any dependencies exist before deleting, if applicable.
        -- If companies have users or other things bound to them, we should check here.
        -- For now, just delete since it's the base logic.
        DELETE FROM empresas WHERE unico = @lcUnico;
        SELECT '' AS Error, 'Company deleted successfully.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error, 'Failed to delete company.' AS Message;
    END CATCH
END
GO
