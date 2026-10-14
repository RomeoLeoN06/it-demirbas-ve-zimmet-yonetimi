$server = "METEHAN\SQLEXPRESS"
$connString = "Server=$server;Database=master;Integrated Security=True;TrustServerCertificate=True;"

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
    $conn.Open()
    $cmd = $conn.CreateCommand()

    $sql = @"
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'it_admin')
BEGIN
    CREATE LOGIN [it_admin] WITH PASSWORD = N'ItDemirbas2026!', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
    PRINT 'Login it_admin created.';
END
ELSE
BEGIN
    ALTER LOGIN [it_admin] WITH PASSWORD = N'ItDemirbas2026!', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
    PRINT 'Login it_admin updated.';
END;

ALTER SERVER ROLE [sysadmin] ADD MEMBER [it_admin];

USE [ITDemirbasDB];
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'it_admin')
BEGIN
    CREATE USER [it_admin] FOR LOGIN [it_admin];
END;
ALTER ROLE [db_owner] ADD MEMBER [it_admin];
"@
    $cmd.CommandText = $sql
    $cmd.ExecuteNonQuery()
    Write-Host "SUCCESS: Login it_admin configured and granted full rights to ITDemirbasDB!"
    $conn.Close()
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
