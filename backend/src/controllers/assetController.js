const QRCode = require('qrcode');
const { db } = require('../config/db');

// Helper to generate QR Code Data URL
async function generateAssetQrCode(assetCode, name, serialNumber, category) {
  const payload = JSON.stringify({
    code: assetCode,
    name: name,
    serial: serialNumber,
    category: category
  });
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
}

// Generate unique asset code
function generateUniqueCode() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM assets').get();
  const nextNum = (countRow.count + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  let candidate = `DMB-${year}-${nextNum}`;
  let exists = db.prepare('SELECT id FROM assets WHERE asset_code = ?').get(candidate);
  let counter = 1;
  while (exists) {
    candidate = `DMB-${year}-${(countRow.count + 1 + counter).toString().padStart(3, '0')}`;
    exists = db.prepare('SELECT id FROM assets WHERE asset_code = ?').get(candidate);
    counter++;
  }
  return candidate;
}

// GET all assets (with search, filter, pagination)
async function getAssets(req, res) {
  try {
    const {
      search = '',
      status = '',
      category = '',
      department = '',
      assigned_to = '',
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClauses = [];
    let params = [];

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(a.name LIKE ? OR a.asset_code LIKE ? OR a.serial_number LIKE ? OR a.brand LIKE ? OR a.model LIKE ? OR u.full_name LIKE ?)');
      params.push(s, s, s, s, s, s);
    }

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    }

    if (category) {
      whereClauses.push('a.category = ?');
      params.push(category);
    }

    if (department) {
      whereClauses.push('u.department = ?');
      params.push(department);
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        whereClauses.push('a.assigned_to_user_id IS NULL');
      } else {
        whereClauses.push('a.assigned_to_user_id = ?');
        params.push(parseInt(assigned_to));
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM assets a
      LEFT JOIN users u ON a.assigned_to_user_id = u.id
      ${whereSql}
    `;
    const totalCount = db.prepare(countSql).get(...params).total;

    // Allowed sort columns
    const allowedSortCols = ['id', 'name', 'asset_code', 'brand', 'model', 'category', 'status', 'purchase_date', 'created_at'];
    const safeSortCol = allowedSortCols.includes(sort_by) ? `a.${sort_by}` : 'a.created_at';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataSql = `
      SELECT 
        a.id, a.asset_code, a.name, a.category, a.brand, a.model,
        a.serial_number, a.purchase_date, a.warranty_end_date, a.purchase_cost,
        a.status, a.notes, a.qr_code_data, a.assigned_to_user_id, a.created_at, a.updated_at,
        u.full_name as assigned_user_name,
        u.email as assigned_user_email,
        u.department as assigned_user_department,
        u.phone as assigned_user_phone
      FROM assets a
      LEFT JOIN users u ON a.assigned_to_user_id = u.id
      ${whereSql}
      ORDER BY ${safeSortCol} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const assets = db.prepare(dataSql).all(...params, parseInt(limit), offset);

    return res.json({
      success: true,
      data: assets,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getAssets error:', error);
    return res.status(500).json({ success: false, message: 'Demirbaşlar listelenirken hata oluştu.' });
  }
}

// GET single asset by ID or code/serial
async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        a.*,
        u.full_name as assigned_user_name,
        u.email as assigned_user_email,
        u.department as assigned_user_department,
        u.phone as assigned_user_phone
      FROM assets a
      LEFT JOIN users u ON a.assigned_to_user_id = u.id
      WHERE a.id = ? OR a.asset_code = ? OR a.serial_number = ?
    `;

    const asset = db.prepare(sql).get(id, id, id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Demirbaş cihaz bulunamadı.' });
    }

    // Fetch assignment history
    const historySql = `
      SELECT 
        asg.id, asg.assigned_date, asg.return_date, asg.status, asg.handover_notes, asg.return_notes,
        u.full_name as user_name, u.email as user_email, u.department as user_department,
        admin.full_name as assigned_by_name
      FROM assignments asg
      LEFT JOIN users u ON asg.user_id = u.id
      LEFT JOIN users admin ON asg.assigned_by_user_id = admin.id
      WHERE asg.asset_id = ?
      ORDER BY asg.assigned_date DESC
    `;
    const history = db.prepare(historySql).all(asset.id);

    return res.json({
      success: true,
      data: {
        ...asset,
        history
      }
    });
  } catch (error) {
    console.error('getAssetById error:', error);
    return res.status(500).json({ success: false, message: 'Demirbaş detayı alınamadı.' });
  }
}

// CREATE new asset
async function createAsset(req, res) {
  try {
    const {
      name,
      category,
      brand,
      model,
      serial_number,
      purchase_date,
      warranty_end_date,
      purchase_cost,
      status = 'depoda',
      notes,
      assigned_to_user_id
    } = req.body;

    if (!name || !category || !brand || !model || !serial_number) {
      return res.status(400).json({
        success: false,
        message: 'Cihaz adı, kategori, marka, model ve seri numarası zorunludur.'
      });
    }

    // Check duplicate serial number
    const existingSerial = db.prepare('SELECT id FROM assets WHERE serial_number = ?').get(serial_number.trim());
    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: 'Bu seri numarasına sahip bir cihaz zaten sistemde kayıtlı.'
      });
    }

    const assetCode = generateUniqueCode();
    const qrCodeData = await generateAssetQrCode(assetCode, name, serial_number, category);

    const initialStatus = assigned_to_user_id ? 'zimmetli' : (status || 'depoda');

    const stmt = db.prepare(`
      INSERT INTO assets (
        asset_code, name, category, brand, model, serial_number,
        purchase_date, warranty_end_date, purchase_cost, status,
        notes, qr_code_data, assigned_to_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      assetCode,
      name.trim(),
      category,
      brand.trim(),
      model.trim(),
      serial_number.trim(),
      purchase_date || null,
      warranty_end_date || null,
      parseFloat(purchase_cost) || 0,
      initialStatus,
      notes || '',
      qrCodeData,
      assigned_to_user_id || null
    );

    const newAssetId = result.lastInsertRowid;

    // If initial assigned user is provided, create assignment record
    if (assigned_to_user_id) {
      db.prepare(`
        INSERT INTO assignments (asset_id, user_id, assigned_by_user_id, status, handover_notes)
        VALUES (?, ?, ?, 'aktif', 'Demirbaş oluşturulurken personele zimmetlendi.')
      `).run(newAssetId, assigned_to_user_id, req.user.id);
    }

    // Audit log
    db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(newAssetId, req.user.id, 'olusturuldu', `Yeni demirbaş eklendi: ${name} (${assetCode})`);

    const createdAsset = db.prepare('SELECT * FROM assets WHERE id = ?').get(newAssetId);

    return res.status(201).json({
      success: true,
      message: 'Demirbaş başarıyla sisteme kaydedildi ve QR kodu oluşturuldu.',
      data: createdAsset
    });
  } catch (error) {
    console.error('createAsset error:', error);
    return res.status(500).json({ success: false, message: 'Demirbaş kaydedilirken hata oluştu.' });
  }
}

// UPDATE asset
async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      brand,
      model,
      serial_number,
      purchase_date,
      warranty_end_date,
      purchase_cost,
      status,
      notes
    } = req.body;

    const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Güncellenecek demirbaş bulunamadı.' });
    }

    if (serial_number && serial_number !== existing.serial_number) {
      const serialExists = db.prepare('SELECT id FROM assets WHERE serial_number = ? AND id != ?').get(serial_number, id);
      if (serialExists) {
        return res.status(400).json({ success: false, message: 'Bu seri numarası başka bir cihazda kayıtlı.' });
      }
    }

    // Re-generate QR if name or serial changed
    let qrCodeData = existing.qr_code_data;
    if ((name && name !== existing.name) || (serial_number && serial_number !== existing.serial_number)) {
      qrCodeData = await generateAssetQrCode(
        existing.asset_code,
        name || existing.name,
        serial_number || existing.serial_number,
        category || existing.category
      );
    }

    db.prepare(`
      UPDATE assets SET
        name = ?, category = ?, brand = ?, model = ?, serial_number = ?,
        purchase_date = ?, warranty_end_date = ?, purchase_cost = ?,
        status = ?, notes = ?, qr_code_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || existing.name,
      category || existing.category,
      brand || existing.brand,
      model || existing.model,
      serial_number || existing.serial_number,
      purchase_date !== undefined ? purchase_date : existing.purchase_date,
      warranty_end_date !== undefined ? warranty_end_date : existing.warranty_end_date,
      purchase_cost !== undefined ? parseFloat(purchase_cost) : existing.purchase_cost,
      status || existing.status,
      notes !== undefined ? notes : existing.notes,
      qrCodeData,
      id
    );

    db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(id, req.user.id, 'guncellendi', `Demirbaş bilgileri güncellendi: ${name || existing.name}`);

    const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: 'Demirbaş bilgileri başarıyla güncellendi.',
      data: updated
    });
  } catch (error) {
    console.error('updateAsset error:', error);
    return res.status(500).json({ success: false, message: 'Demirbaş güncellenirken hata oluştu.' });
  }
}

// DELETE asset
async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Silinecek demirbaş bulunamadı.' });
    }

    if (existing.status === 'zimmetli') {
      return res.status(400).json({
        success: false,
        message: 'Zimmette bulunan bir cihaz silinemez. Lütfen önce zimmetten düşün.'
      });
    }

    db.prepare('DELETE FROM assets WHERE id = ?').run(id);

    db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(null, req.user.id, 'silindi', `Demirbaş silindi: ${existing.name} (${existing.asset_code})`);

    return res.json({
      success: true,
      message: 'Demirbaş başarıyla sistemden silindi.'
    });
  } catch (error) {
    console.error('deleteAsset error:', error);
    return res.status(500).json({ success: false, message: 'Demirbaş silinirken hata oluştu.' });
  }
}

// Report Fault (Arıza Durumu Bildir)
async function reportFault(req, res) {
  try {
    const { id } = req.params;
    const { fault_description } = req.body;

    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Demirbaş bulunamadı.' });
    }

    const noteAppend = `\n[ARIZA BİLDİRİMİ - ${new Date().toLocaleString('tr-TR')} - Bildiren: ${req.user.full_name}]: ${fault_description || 'Arıza bildirildi.'}`;
    const newNotes = (asset.notes || '') + noteAppend;

    db.prepare('UPDATE assets SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('arizali', newNotes, id);

    db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(id, req.user.id, 'ariza_bildirildi', `Arıza bildirildi: ${fault_description || 'Detay belirtilmedi'}`);

    return res.json({
      success: true,
      message: 'Arıza bildirimi kaydedildi ve cihaz durumu "Arızalı" olarak güncellendi.'
    });
  } catch (error) {
    console.error('reportFault error:', error);
    return res.status(500).json({ success: false, message: 'Arıza bildirimi kaydedilemedi.' });
  }
}

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  reportFault
};
