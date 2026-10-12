const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { db, initDb } = require('../config/db');

async function seed() {
  console.log('--- Veritabanı İlklendiriliyor ve Tohumlanıyor ---');
  initDb();

  // Check if users exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Veritabanında zaten veriler mevcut, tohumlama atlanıyor.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin123!', salt);
  const userHash = bcrypt.hashSync('User123!', salt);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, department, phone, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run(
    'Alperen Demir (Yönetici)',
    'admin@kurum.gov.tr',
    adminHash,
    'admin',
    'Bilgi İşlem ve Yapay Zeka Dairesi',
    '0555 123 4567',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );
  const adminId = adminResult.lastInsertRowid;

  const u1 = insertUser.run(
    'Ahmet Yılmaz',
    'ahmet.yilmaz@kurum.gov.tr',
    userHash,
    'personnel',
    'Yazılım ve Yapay Zeka Geliştirme',
    '0555 234 5678',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  ).lastInsertRowid;

  const u2 = insertUser.run(
    'Ayşe Kaya',
    'ayse.kaya@kurum.gov.tr',
    userHash,
    'personnel',
    'Dijital Dönüşüm ve Koordinasyon',
    '0555 345 6789',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  ).lastInsertRowid;

  const u3 = insertUser.run(
    'Mehmet Demir',
    'mehmet.demir@kurum.gov.tr',
    userHash,
    'personnel',
    'Sistem ve Siber Güvenlik',
    '0555 456 7890',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ).lastInsertRowid;

  const u4 = insertUser.run(
    'Zeynep Çelik',
    'zeynep.celik@kurum.gov.tr',
    userHash,
    'personnel',
    'Veri Bilimi ve Makine Öğrenimi',
    '0555 567 8901',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  ).lastInsertRowid;

  console.log('✓ Kullanıcılar oluşturuldu (1 Admin, 4 Personel)');

  // Assets list
  const sampleAssets = [
    {
      code: 'DMB-2026-001',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Bilgisayar',
      brand: 'Apple',
      model: 'MacBook Pro 16 (64GB / 1TB SSD)',
      serial: 'APL-MBP16-9923841',
      purchaseDate: '2025-01-15',
      warrantyEnd: '2027-01-15',
      cost: 115000,
      status: 'zimmetli',
      assignedTo: u1,
      notes: 'Yapay zeka modelleri eğitimi ve mobil uygulama geliştirme için tahsis edildi.'
    },
    {
      code: 'DMB-2026-002',
      name: 'Dell Latitude 5540 İş İstasyonu',
      category: 'Bilgisayar',
      brand: 'Dell',
      model: 'Latitude 5540 i7-1365U 32GB RAM',
      serial: 'DLL-LAT55-4482910',
      purchaseDate: '2025-02-10',
      warrantyEnd: '2028-02-10',
      cost: 54000,
      status: 'zimmetli',
      assignedTo: u2,
      notes: 'Dijital Dönüşüm koordinasyon görevleri için tahsis edildi.'
    },
    {
      code: 'DMB-2026-003',
      name: 'Lenovo ThinkPad P1 Gen 6',
      category: 'Bilgisayar',
      brand: 'Lenovo',
      model: 'ThinkPad P1 RTX 4080 64GB',
      serial: 'LNV-P1G6-8837192',
      purchaseDate: '2024-11-05',
      warrantyEnd: '2027-11-05',
      cost: 98000,
      status: 'zimmetli',
      assignedTo: u4,
      notes: 'Büyük dil modelleri çıkarımı ve veri görselleştirme amaçlı.'
    },
    {
      code: 'DMB-2026-004',
      name: 'Dell UltraSharp 32" 4K Monitör',
      category: 'Monitör',
      brand: 'Dell',
      model: 'U3223QE 4K USB-C Hub',
      serial: 'DLL-U32-6629104',
      purchaseDate: '2025-01-20',
      warrantyEnd: '2028-01-20',
      cost: 29500,
      status: 'zimmetli',
      assignedTo: u1,
      notes: 'Yazılım geliştirme çift ekran kurulumu.'
    },
    {
      code: 'DMB-2026-005',
      name: 'LG UltraWide 34" Kavisli Monitör',
      category: 'Monitör',
      brand: 'LG',
      model: '34WP65C-B QHD 160Hz',
      serial: 'LG-34W-1192837',
      purchaseDate: '2024-12-01',
      warrantyEnd: '2026-12-01',
      cost: 16800,
      status: 'depoda',
      assignedTo: null,
      notes: 'Yedek depoda hazır vaziyette bekliyor.'
    },
    {
      code: 'DMB-2026-006',
      name: 'HPE ProLiant DL380 Gen10 Sunucu',
      category: 'Sunucu',
      brand: 'HPE',
      model: 'DL380 2x Xeon Gold 6248R 256GB',
      serial: 'HPE-DL380-5573829',
      purchaseDate: '2024-05-18',
      warrantyEnd: '2027-05-18',
      cost: 345000,
      status: 'zimmetli',
      assignedTo: u3,
      notes: 'Sistem Odası Kabinet 2, U14-U16. Yerel sunucu ve model barındırma.'
    },
    {
      code: 'DMB-2026-007',
      name: 'Cisco Catalyst 9300 48 Port Switch',
      category: 'Ağ Cihazı',
      brand: 'Cisco',
      model: 'C9300-48P PoE+',
      serial: 'CSC-9300-3349182',
      purchaseDate: '2024-06-12',
      warrantyEnd: '2029-06-12',
      cost: 120000,
      status: 'zimmetli',
      assignedTo: u3,
      notes: 'Kat 3 Ana Omurga Ağı.'
    },
    {
      code: 'DMB-2026-008',
      name: 'HP LaserJet Enterprise Flow Çok Fonksiyonlu Yazıcı',
      category: 'Yazıcı',
      brand: 'HP',
      model: 'M636z Çok Fonksiyonlu',
      serial: 'HP-M636-7728190',
      purchaseDate: '2023-09-10',
      warrantyEnd: '2026-09-10',
      cost: 42000,
      status: 'arizali',
      assignedTo: null,
      notes: 'Kağıt besleme ünitesinde mekanik sıkışma arızası tespit edildi. Servis çağrıldı.'
    },
    {
      code: 'DMB-2026-009',
      name: 'Apple iPad Pro 12.9" M2 + Magic Keyboard',
      category: 'Tablet',
      brand: 'Apple',
      model: 'iPad Pro 12.9 6th Gen 256GB Wi-Fi+Cellular',
      serial: 'APL-IPD12-9918234',
      purchaseDate: '2025-03-01',
      warrantyEnd: '2027-03-01',
      cost: 52000,
      status: 'depoda',
      assignedTo: null,
      notes: 'Yeni alım, saha denetimleri için rezervasyona hazır.'
    },
    {
      code: 'DMB-2026-010',
      name: 'Synology RackStation RS2423+ NAS',
      category: 'Sunucu',
      brand: 'Synology',
      model: 'RS2423+ 12 Bay 48TB Depolama',
      serial: 'SYN-RS24-4472819',
      purchaseDate: '2024-08-22',
      warrantyEnd: '2027-08-22',
      cost: 185000,
      status: 'zimmetli',
      assignedTo: u3,
      notes: 'Yedekleme ve veri arşivleme sunucusu.'
    },
    {
      code: 'DMB-2026-011',
      name: 'Asus ROG Swift 27" Monitör',
      category: 'Monitör',
      brand: 'Asus',
      model: 'PG279QM 240Hz 2K',
      serial: 'ASU-PG27-1182740',
      purchaseDate: '2023-04-10',
      warrantyEnd: '2025-04-10',
      cost: 21000,
      status: 'bakimda',
      assignedTo: null,
      notes: 'Güç kartı arızası nedeniyle yetkili serviste parça değişimi bekleniyor.'
    },
    {
      code: 'DMB-2026-012',
      name: 'Fortinet FortiGate 100F Güvenlik Duvarı',
      category: 'Ağ Cihazı',
      brand: 'Fortinet',
      model: 'FG-100F UTM Firewall',
      serial: 'FTN-FG10-9938210',
      purchaseDate: '2024-01-10',
      warrantyEnd: '2029-01-10',
      cost: 140000,
      status: 'zimmetli',
      assignedTo: u3,
      notes: 'Sistem Odası, Dış Hat Güvenlik Duvarı.'
    }
  ];

  const insertAsset = db.prepare(`
    INSERT INTO assets (
      asset_code, name, category, brand, model, serial_number,
      purchase_date, warranty_end_date, purchase_cost, status,
      notes, qr_code_data, assigned_to_user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAssignment = db.prepare(`
    INSERT INTO assignments (
      asset_id, user_id, assigned_by_user_id, assigned_date,
      status, handover_notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (asset_id, user_id, action, details)
    VALUES (?, ?, ?, ?)
  `);

  for (const item of sampleAssets) {
    // Generate QR code data payload (e.g. JSON with code, serial, name)
    const qrPayload = JSON.stringify({
      code: item.code,
      name: item.name,
      serial: item.serial,
      category: item.category
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    const assetRes = insertAsset.run(
      item.code,
      item.name,
      item.category,
      item.brand,
      item.model,
      item.serial,
      item.purchaseDate,
      item.warrantyEnd,
      item.cost,
      item.status,
      item.notes,
      qrDataUrl,
      item.assignedTo
    );
    const assetId = assetRes.lastInsertRowid;

    insertAudit.run(
      assetId,
      adminId,
      'olusturuldu',
      `Demirbaş sisteme eklendi: ${item.name} (${item.code})`
    );

    if (item.assignedTo) {
      insertAssignment.run(
        assetId,
        item.assignedTo,
        adminId,
        '2025-03-01 09:30:00',
        'aktif',
        'Kullanıcıya çalışır ve eksiksiz vaziyette teslim edildi.'
      );

      insertAudit.run(
        assetId,
        adminId,
        'zimmetlendi',
        `Cihaz personele zimmetlendi. Kullanıcı ID: ${item.assignedTo}`
      );
    }
  }

  console.log(`✓ ${sampleAssets.length} adet demirbaş ve zimmet kayıtları oluşturuldu.`);
  console.log('--- Tohumlama Başarıyla Tamamlandı! ---');
}

if (require.main === module) {
  seed().catch(console.error);
}

module.exports = seed;
