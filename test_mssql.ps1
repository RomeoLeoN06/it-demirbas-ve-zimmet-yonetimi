$connString = "Server=METEHAN\SQLEXPRESS;Database=ITDemirbasDB;Integrated Security=True;TrustServerCertificate=True;"
try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
    $conn.Open()
    $cmd = $conn.CreateCommand()
    
    $tables = @('users', 'assets', 'assignments', 'audit_logs')
    foreach ($t in $tables) {
        $cmd.CommandText = "SELECT COUNT(*) FROM $t"
        $cnt = $cmd.ExecuteScalar()
        Write-Host "$t count: $cnt"
    }

    $cmd.CommandText = "SELECT TOP 3 id, full_name, email, role FROM users"
    $r = $cmd.ExecuteReader()
    while ($r.Read()) {
        Write-Host "User: $($r['id']) | $($r['full_name']) | $($r['email']) | $($r['role'])"
    }
    $r.Close()

    $conn.Close()
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
