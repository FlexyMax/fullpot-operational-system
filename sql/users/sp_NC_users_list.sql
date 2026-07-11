IF OBJECT_ID('[dbo].[sp_NC_users_list]', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_NC_users_list];
GO

CREATE PROCEDURE [dbo].[sp_NC_users_list]
AS
SET NOCOUNT ON
SELECT unico, username, nivel, clave, cedula, nombres, apellidos,
       image, cargo, activo, correo, usuario,
       windows_usuario, windows_password,
       u2fa = U2FA
FROM usuarios
ORDER BY apellidos, nombres
GO
