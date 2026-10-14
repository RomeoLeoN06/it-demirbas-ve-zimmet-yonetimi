$server = "METEHAN\SQLEXPRESS"
$connString = "Server=$server;Database=master;Integrated Security=True;TrustServerCertificate=True;"

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
    $conn.Open()
    Write-Host "Connected to master on $server"

    # Create Database if not exists
    $createDbSql = @"
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ITDemirbasDB')
BEGIN
    CREATE DATABASE ITDemirbasDB;
    PRINT 'ITDemirbasDB created successfully.';
END
ELSE
BEGIN
    PRINT 'ITDemirbasDB already exists.';
END
"@
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $createDbSql
    $cmd.ExecuteNonQuery()
    $conn.Close()

    # Connect to ITDemirbasDB to create tables
    $dbConnString = "Server=$server;Database=ITDemirbasDB;Integrated Security=True;TrustServerCertificate=True;"
    $dbConn = New-Object System.Data.SqlClient.SqlConnection($dbConnString)
    $dbConn.Open()
    Write-Host "Connected to ITDemirbasDB"

    $createTablesSql = @"
-- USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NULL,
        role NVARCHAR(50) DEFAULT 'personnel',
        department NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        avatar_url NVARCHAR(500) NULL,
        google_id NVARCHAR(255) NULL,
        is_active INT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'users table created.';
END

-- ASSETS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'assets')
BEGIN
    CREATE TABLE assets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        asset_code NVARCHAR(100) UNIQUE NOT NULL,
        name NVARCHAR(255) NOT NULL,
        category NVARCHAR(100) NOT NULL,
        brand NVARCHAR(100) NOT NULL,
        model NVARCHAR(100) NOT NULL,
        serial_number NVARCHAR(100) UNIQUE NOT NULL,
        purchase_date NVARCHAR(50) NULL,
        warranty_end_date NVARCHAR(50) NULL,
        purchase_cost FLOAT DEFAULT 0,
        status NVARCHAR(50) DEFAULT 'depoda',
        notes NVARCHAR(MAX) NULL,
        qr_code_data NVARCHAR(MAX) NULL,
        assigned_to_user_id INT NULL FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'assets table created.';
END

-- ASSIGNMENTS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'assignments')
BEGIN
    CREATE TABLE assignments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        asset_id INT NOT NULL FOREIGN KEY REFERENCES assets(id) ON DELETE CASCADE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        assigned_by_user_id INT NULL,
        assigned_date DATETIME2 DEFAULT GETDATE(),
        return_date DATETIME2 NULL,
        status NVARCHAR(50) DEFAULT 'aktif',
        handover_notes NVARCHAR(MAX) NULL,
        return_notes NVARCHAR(MAX) NULL,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'assignments table created.';
END

-- AUDIT LOGS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
BEGIN
    CREATE TABLE audit_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        asset_id INT NULL,
        user_id INT NULL,
        action NVARCHAR(100) NOT NULL,
        details NVARCHAR(MAX) NULL,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'audit_logs table created.';
END

-- DEPARTMENTS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
BEGIN
    CREATE TABLE departments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) UNIQUE NOT NULL,
        description NVARCHAR(500) NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'departments table created.';
END

-- ROLES TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(50) UNIQUE NOT NULL,
        display_name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        is_system INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'roles table created.';
END

-- INDEXES
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assets_status' AND object_id = OBJECT_ID('assets'))
    CREATE INDEX idx_assets_status ON assets(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assets_category' AND object_id = OBJECT_ID('assets'))
    CREATE INDEX idx_assets_category ON assets(category);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assets_code' AND object_id = OBJECT_ID('assets'))
    CREATE INDEX idx_assets_code ON assets(asset_code);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assignments_asset' AND object_id = OBJECT_ID('assignments'))
    CREATE INDEX idx_assignments_asset ON assignments(asset_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assignments_user' AND object_id = OBJECT_ID('assignments'))
    CREATE INDEX idx_assignments_user ON assignments(user_id);
"@

    $tableCmd = $dbConn.CreateCommand()
    $tableCmd.CommandText = $createTablesSql
    $tableCmd.ExecuteNonQuery()
    Write-Host "Database and tables successfully setup in ITDemirbasDB!"
    $dbConn.Close()

} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
