IF OBJECT_ID('[dbo].[sp_NC_User_Info]', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_NC_User_Info];
GO

CREATE PROCEDURE [dbo].[sp_NC_User_Info]
    @lcUser_uq char(8)
AS
SET NOCOUNT ON
SELECT unico, username, level = nivel, password = clave,
       name = nombres, last_name = apellidos, image,
       user_profile = cargo, active = activo, email = correo,
       u2fa = U2FA
FROM usuarios
WHERE unico = @lcUser_uq
GO
