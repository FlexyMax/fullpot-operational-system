IF OBJECT_ID('[dbo].[sp_NC_user_update]', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_NC_user_update];
GO

CREATE PROCEDURE [dbo].[sp_NC_user_update]
    @lcUnico           char(8),
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
    @lcActivo          bit          = NULL,
    @lcU2FA            bit          = NULL
AS
SET NOCOUNT ON
DECLARE @lcMessage varchar(1000) = '', @llerror bit = 0
IF EXISTS (SELECT 1 FROM usuarios WHERE username = @lcUserName AND unico <> @lcUnico)
BEGIN
    SELECT @lcMessage = 'There is another user with the same username. Please change user name.', @llerror = 1
END
BEGIN TRY
    IF @llerror = 0
    BEGIN
        UPDATE usuarios
        SET username         = @lcUserName,
            nombres          = @lcFirstName,
            apellidos        = @lcLastName,
            nivel            = @lcLevel,
            clave            = @lcPassword,
            cargo            = @lcPosition,
            correo           = @lcemail,
            cedula           = @lcCedula,
            windows_usuario  = @lcWindowsUser,
            windows_password = @lcWindowsPassword,
            activo           = ISNULL(@lcActivo, activo),
            U2FA             = ISNULL(@lcU2FA,   U2FA)
        WHERE unico = @lcUnico
        SET @lcMessage = 'User Updated Successfully.'
    END
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
        @accion     = 'Update',
        @tabla      = 'usuarios',
        @registro   = @lcUnico,
        @ext_accion = 'N/A'
END
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
GO
