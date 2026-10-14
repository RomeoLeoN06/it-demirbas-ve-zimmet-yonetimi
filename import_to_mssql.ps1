$server = "METEHAN\SQLEXPRESS"
$dbConnString = "Server=$server;Database=ITDemirbasDB;Integrated Security=True;TrustServerCertificate=True;"

$jsonPath = Join-Path $PSScriptRoot "sqlite_data.json"
$jsonRaw = Get-Content -Raw -Path $jsonPath -Encoding UTF8
$data = $jsonRaw | ConvertFrom-Json

$conn = New-Object System.Data.SqlClient.SqlConnection($dbConnString)
$conn.Open()

function Get-Val($val) {
    if ($null -eq $val -or $val -eq '') {
        return [DBNull]::Value
    }
    return $val
}

# Clean existing records if any
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
DELETE FROM audit_logs;
DELETE FROM assignments;
DELETE FROM assets;
DELETE FROM users;
"@
$cmd.ExecuteNonQuery()
Write-Host "Cleared existing records in ITDemirbasDB."

# 1. Insert Users
$cmd.CommandText = "SET IDENTITY_INSERT users ON"
$cmd.ExecuteNonQuery()

foreach ($u in $data.users) {
    $insertCmd = $conn.CreateCommand()
    $insertCmd.CommandText = @"
INSERT INTO users (id, full_name, email, password_hash, role, department, phone, avatar_url, google_id, is_active, created_at, updated_at)
VALUES (@id, @full_name, @email, @password_hash, @role, @department, @phone, @avatar_url, @google_id, @is_active, @created_at, @updated_at)
"@
    $insertCmd.Parameters.AddWithValue("@id", [int]$u.id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@full_name", [string]$u.full_name) | Out-Null
    $insertCmd.Parameters.AddWithValue("@email", [string]$u.email) | Out-Null
    $insertCmd.Parameters.AddWithValue("@password_hash", (Get-Val $u.password_hash)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@role", [string]$u.role) | Out-Null
    $insertCmd.Parameters.AddWithValue("@department", (Get-Val $u.department)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@phone", (Get-Val $u.phone)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@avatar_url", (Get-Val $u.avatar_url)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@google_id", (Get-Val $u.google_id)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@is_active", [int]$u.is_active) | Out-Null
    $insertCmd.Parameters.AddWithValue("@created_at", [string]$u.created_at) | Out-Null
    $insertCmd.Parameters.AddWithValue("@updated_at", [string]$u.updated_at) | Out-Null
    $insertCmd.ExecuteNonQuery() | Out-Null
}
$cmd.CommandText = "SET IDENTITY_INSERT users OFF"
$cmd.ExecuteNonQuery()
Write-Host "Users inserted successfully: $($data.users.Count)"

# 2. Insert Assets
$cmd.CommandText = "SET IDENTITY_INSERT assets ON"
$cmd.ExecuteNonQuery()

foreach ($a in $data.assets) {
    $insertCmd = $conn.CreateCommand()
    $insertCmd.CommandText = @"
INSERT INTO assets (id, asset_code, name, category, brand, model, serial_number, purchase_date, warranty_end_date, purchase_cost, status, notes, qr_code_data, assigned_to_user_id, created_at, updated_at)
VALUES (@id, @asset_code, @name, @category, @brand, @model, @serial_number, @purchase_date, @warranty_end_date, @purchase_cost, @status, @notes, @qr_code_data, @assigned_to_user_id, @created_at, @updated_at)
"@
    $insertCmd.Parameters.AddWithValue("@id", [int]$a.id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@asset_code", [string]$a.asset_code) | Out-Null
    $insertCmd.Parameters.AddWithValue("@name", [string]$a.name) | Out-Null
    $insertCmd.Parameters.AddWithValue("@category", [string]$a.category) | Out-Null
    $insertCmd.Parameters.AddWithValue("@brand", [string]$a.brand) | Out-Null
    $insertCmd.Parameters.AddWithValue("@model", [string]$a.model) | Out-Null
    $insertCmd.Parameters.AddWithValue("@serial_number", [string]$a.serial_number) | Out-Null
    $insertCmd.Parameters.AddWithValue("@purchase_date", (Get-Val $a.purchase_date)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@warranty_end_date", (Get-Val $a.warranty_end_date)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@purchase_cost", [double]$a.purchase_cost) | Out-Null
    $insertCmd.Parameters.AddWithValue("@status", [string]$a.status) | Out-Null
    $insertCmd.Parameters.AddWithValue("@notes", (Get-Val $a.notes)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@qr_code_data", (Get-Val $a.qr_code_data)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@assigned_to_user_id", (Get-Val $a.assigned_to_user_id)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@created_at", [string]$a.created_at) | Out-Null
    $insertCmd.Parameters.AddWithValue("@updated_at", [string]$a.updated_at) | Out-Null
    $insertCmd.ExecuteNonQuery() | Out-Null
}
$cmd.CommandText = "SET IDENTITY_INSERT assets OFF"
$cmd.ExecuteNonQuery()
Write-Host "Assets inserted successfully: $($data.assets.Count)"

# 3. Insert Assignments
$cmd.CommandText = "SET IDENTITY_INSERT assignments ON"
$cmd.ExecuteNonQuery()

foreach ($asg in $data.assignments) {
    $insertCmd = $conn.CreateCommand()
    $insertCmd.CommandText = @"
INSERT INTO assignments (id, asset_id, user_id, assigned_by_user_id, assigned_date, return_date, status, handover_notes, return_notes, created_at)
VALUES (@id, @asset_id, @user_id, @assigned_by_user_id, @assigned_date, @return_date, @status, @handover_notes, @return_notes, @created_at)
"@
    $insertCmd.Parameters.AddWithValue("@id", [int]$asg.id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@asset_id", [int]$asg.asset_id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@user_id", [int]$asg.user_id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@assigned_by_user_id", (Get-Val $asg.assigned_by_user_id)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@assigned_date", [string]$asg.assigned_date) | Out-Null
    $insertCmd.Parameters.AddWithValue("@return_date", (Get-Val $asg.return_date)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@status", [string]$asg.status) | Out-Null
    $insertCmd.Parameters.AddWithValue("@handover_notes", (Get-Val $asg.handover_notes)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@return_notes", (Get-Val $asg.return_notes)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@created_at", [string]$asg.created_at) | Out-Null
    $insertCmd.ExecuteNonQuery() | Out-Null
}
$cmd.CommandText = "SET IDENTITY_INSERT assignments OFF"
$cmd.ExecuteNonQuery()
Write-Host "Assignments inserted successfully: $($data.assignments.Count)"

# 4. Insert Audit Logs
$cmd.CommandText = "SET IDENTITY_INSERT audit_logs ON"
$cmd.ExecuteNonQuery()

foreach ($log in $data.audit_logs) {
    $insertCmd = $conn.CreateCommand()
    $insertCmd.CommandText = @"
INSERT INTO audit_logs (id, asset_id, user_id, action, details, created_at)
VALUES (@id, @asset_id, @user_id, @action, @details, @created_at)
"@
    $insertCmd.Parameters.AddWithValue("@id", [int]$log.id) | Out-Null
    $insertCmd.Parameters.AddWithValue("@asset_id", (Get-Val $log.asset_id)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@user_id", (Get-Val $log.user_id)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@action", [string]$log.action) | Out-Null
    $insertCmd.Parameters.AddWithValue("@details", (Get-Val $log.details)) | Out-Null
    $insertCmd.Parameters.AddWithValue("@created_at", [string]$log.created_at) | Out-Null
    $insertCmd.ExecuteNonQuery() | Out-Null
}
$cmd.CommandText = "SET IDENTITY_INSERT audit_logs OFF"
$cmd.ExecuteNonQuery()
Write-Host "Audit logs inserted successfully: $($data.audit_logs.Count)"

$conn.Close()
Write-Host "ALL DATA MIGRATED TO MSSQL (ITDemirbasDB) SUCCESSFULLY!"
