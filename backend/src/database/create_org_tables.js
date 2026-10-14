const { db } = require('../config/db');

async function setupOrgTables() {
  try {
    console.log('Creating departments and roles tables...');
    await db.exec(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
      BEGIN
        CREATE TABLE departments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) UNIQUE NOT NULL,
          description NVARCHAR(500) NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END;

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
      END;
    `);

    // Populate departments if empty
    const depCount = await db.prepare('SELECT COUNT(*) as c FROM departments').get();
    if (depCount.c === 0) {
      const defaultDeps = [
        ['Bilgi İşlem ve Yapay Zeka Dairesi', 'Kurumsal BT altyapısı, sistem mimarisi ve yapay zeka koordinasyonu'],
        ['Yazılım ve Yapay Zeka Geliştirme', 'Büyük dil modelleri, kurumsal web/mobil yazılımlar ve API entegrasyonları'],
        ['Sistem ve Siber Güvenlik', 'Ağ güvenliği, sunucu altyapısı, siber güvenlik operasyonları'],
        ['Dijital Dönüşüm ve Koordinasyon', 'Kurum içi dijital dönüşüm süreçleri ve envanter planlaması'],
        ['Veri Bilimi ve Makine Öğrenimi', 'Veri analitiği, yapay zeka tahminleme ve makine öğrenimi modelleri']
      ];
      for (const [name, desc] of defaultDeps) {
        await db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run(name, desc);
      }
      console.log('Default departments seeded.');
    }

    // Populate roles if empty
    const roleCount = await db.prepare('SELECT COUNT(*) as c FROM roles').get();
    if (roleCount.c === 0) {
      const defaultRoles = [
        ['admin', 'Sistem Yöneticisi', 'Tüm envanter, kullanıcı, zimmet ve sistem ayarlarına tam yetki', 1],
        ['personnel', 'Standart Personel', 'Kendi üzerine zimmetli donanımları görüntüleme ve arıza bildirme', 1],
        ['teknik_servis', 'Teknik Destek Sorumlusu', 'Arıza kayıtlarını inceleme, bakım ve donanım süreçlerini yönetme', 0],
        ['birim_yoneticisi', 'Birim Yöneticisi', 'Bağlı olduğu departmandaki zimmetli cihazları izleme ve talep yönetimi', 0],
        ['stajyer', 'Aday Mühendis / Stajyer', 'Temel personel yetkileri ve zimmet kabul', 0]
      ];
      for (const [name, disp, desc, sys] of defaultRoles) {
        await db.prepare('INSERT INTO roles (name, display_name, description, is_system) VALUES (?, ?, ?, ?)').run(name, disp, desc, sys);
      }
      console.log('Default roles seeded.');
    }

    const deps = await db.prepare('SELECT * FROM departments').all();
    const roles = await db.prepare('SELECT * FROM roles').all();
    console.log(`Success! Departments: ${deps.length}, Roles: ${roles.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setupOrgTables();
