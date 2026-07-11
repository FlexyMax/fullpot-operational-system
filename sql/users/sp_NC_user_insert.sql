IF OBJECT_ID('[dbo].[sp_NC_user_insert]', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_NC_user_insert];
GO

CREATE PROCEDURE [dbo].[sp_NC_user_insert]
    @lcUserName        varchar(50),
    @lcFirstName       varchar(30),
    @lcLastName        varchar(30),
    @lcLevel           varchar(20),
    @lcPassword        varchar(50),
    @lcPosition        varchar(50),
    @lcemail           varchar(200),
    @lcOperator_uq     char(8)      = '',
    @lcCedula          varchar(50)  = '',
    @lcWindowsUser     varchar(20)  = '',
    @lcWindowsPassword varchar(20)  = '',
    @lcU2FA            bit          = 0
AS
SET NOCOUNT ON
DECLARE @lcMessage varchar(1000) = '', @llerror bit = 0
DECLARE @lcUnico char(8)
SET @lcUnico = LEFT(NEWID(), 8)
BEGIN TRY
    INSERT INTO usuarios
        (unico, username, nombres, apellidos, nivel, clave, cargo, correo, image,
         cedula, windows_usuario, windows_password, U2FA, activo)
    VALUES
        (@lcUnico, @lcUserName, @lcFirstName, @lcLastName,
         @lcLevel, @lcPassword, @lcPosition, @lcemail, '',
         @lcCedula, @lcWindowsUser, @lcWindowsPassword, @lcU2FA, 1)
    SET @lcMessage = 'User Created Successfully.'
END TRY
BEGIN CATCH
    SELECT @lcMessage = ERROR_MESSAGE(), @llerror = 1
END CATCH
IF @llerror = 0
BEGIN
    DECLARE @lcEmpresa_uq char(8) = ISNULL((SELECT TOP 1 unico FROM empresas ORDER BY unico), '        ')
    EXEC sp_sistema_bitacora_insert
        @user_uq    = @lcOperator_uq,
        @empresa_uq = @lcEmpresa_uq,
        @panta_uq   = 'YK618352',
        @accion     = 'Insert',
        @tabla      = 'usuarios',
        @registro   = @lcUnico,
        @ext_accion = 'N/A'
END
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO
