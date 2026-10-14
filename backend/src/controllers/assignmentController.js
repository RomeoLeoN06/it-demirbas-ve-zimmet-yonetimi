const { db } = require('../config/db');

// Assign asset to user (Personele Zimmetle)
async function assignAsset(req, res) {
  try {
    const { asset_id, user_id, handover_notes, assigned_date } = req.body;

    if (!asset_id || !user_id) {
      return res.status(400).json({ success: false, message: 'Cihaz ve personel seçimi zorunludur.' });
    }

    const trimmedAssetId = asset_id ? asset_id.toString().trim() : '';
    const isAssetNumeric = /^\d+$/.test(trimmedAssetId);
    const asset = await db.prepare(
      isAssetNumeric ? 'SELECT * FROM assets WHERE id = ? OR asset_code = ?' : 'SELECT * FROM assets WHERE asset_code = ?'
    ).get(isAssetNumeric ? parseInt(trimmedAssetId, 10) : trimmedAssetId, ...(isAssetNumeric ? [trimmedAssetId] : []));

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Demirbaş bulunamadı.' });
    }

    if (asset.status === 'zimmetli') {
      return res.status(400).json({
        success: false,
        message: 'Bu cihaz zaten bir personele zimmetlidir. Önce mevcut zimmeti sonlandırınız.'
      });
    }

    if (asset.status === 'arizali' || asset.status === 'hurda') {
      return res.status(400).json({
        success: false,
        message: `Bu cihaz '${asset.status}' durumunda olduğu için zimmetlenemez.`
      });
    }

    const user = await db.prepare('SELECT id, full_name, email, department FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Seçilen personel bulunamadı.' });
    }

    const assignDate = assigned_date || new Date().toISOString();

    // Insert assignment record
    const insertStmt = db.prepare(`
      INSERT INTO assignments (asset_id, user_id, assigned_by_user_id, assigned_date, status, handover_notes)
      VALUES (?, ?, ?, ?, 'aktif', ?)
    `);
    const assignResult = await insertStmt.run(
      asset.id,
      user_id,
      req.user.id,
      assignDate,
      handover_notes || 'Cihaz personele teslim edildi.'
    );

    // Update asset
    await db.prepare(`
      UPDATE assets
      SET status = 'zimmetli', assigned_to_user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user_id, asset.id);

    // Audit log
    await db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(
        asset.id,
        req.user.id,
        'zimmetlendi',
        `Demirbaş "${asset.name}" (${asset.asset_code}) -> Personele teslim edildi: ${user.full_name} (${user.department})`
      );

    return res.status(201).json({
      success: true,
      message: `Cihaz başarıyla ${user.full_name} personeline zimmetlendi.`,
      assignment_id: assignResult.lastInsertRowid
    });
  } catch (error) {
    console.error('assignAsset error:', error);
    return res.status(500).json({ success: false, message: 'Zimmet işlemi gerçekleştirilemedi.' });
  }
}

// Return asset from user (Zimmetten Düş / İade Kabul Et)
async function returnAsset(req, res) {
  try {
    const { asset_id, return_notes, return_condition = 'depoda' } = req.body;

    if (!asset_id) {
      return res.status(400).json({ success: false, message: 'Cihaz ID zorunludur.' });
    }

    const trimmedAssetId = asset_id ? asset_id.toString().trim() : '';
    const isAssetNumeric = /^\d+$/.test(trimmedAssetId);
    const asset = await db.prepare(
      isAssetNumeric ? 'SELECT * FROM assets WHERE id = ? OR asset_code = ?' : 'SELECT * FROM assets WHERE asset_code = ?'
    ).get(isAssetNumeric ? parseInt(trimmedAssetId, 10) : trimmedAssetId, ...(isAssetNumeric ? [trimmedAssetId] : []));

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Demirbaş bulunamadı.' });
    }

    if (asset.status !== 'zimmetli' && !asset.assigned_to_user_id) {
      return res.status(400).json({ success: false, message: 'Bu cihaz zaten zimmetli değil.' });
    }

    // Find active assignment
    const activeAssignment = await db.prepare(`
      SELECT * FROM assignments
      WHERE asset_id = ? AND status = 'aktif'
      ORDER BY assigned_date DESC
      LIMIT 1
    `).get(asset.id);

    const now = new Date().toISOString();

    if (activeAssignment) {
      await db.prepare(`
        UPDATE assignments
        SET status = 'iade_edildi', return_date = ?, return_notes = ?
        WHERE id = ?
      `).run(now, return_notes || 'Cihaz depoya iade alındı.', activeAssignment.id);
    }

    // Set asset status (e.g. 'depoda', 'arizali', 'bakimda')
    const finalStatus = ['depoda', 'arizali', 'bakimda'].includes(return_condition) ? return_condition : 'depoda';

    await db.prepare(`
      UPDATE assets
      SET status = ?, assigned_to_user_id = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(finalStatus, asset.id);

    // Audit log
    await db.prepare('INSERT INTO audit_logs (asset_id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .run(
        asset.id,
        req.user.id,
        'iade_edildi',
        `Demirbaş "${asset.name}" (${asset.asset_code}) zimmetten düşüldü ve durumu "${finalStatus}" yapıldı.`
      );

    return res.json({
      success: true,
      message: `Demirbaş başarıyla zimmetten düşüldü ve ${finalStatus} statüsüne alındı.`
    });
  } catch (error) {
    console.error('returnAsset error:', error);
    return res.status(500).json({ success: false, message: 'Zimmetten düşme işlemi gerçekleştirilemedi.' });
  }
}

// Get logged-in user's personal assigned assets (Kişisel Zimmet Ekranı)
async function getMyAssets(req, res) {
  try {
    const assets = await db.prepare(`
      SELECT 
        a.id, a.asset_code, a.name, a.category, a.brand, a.model,
        a.serial_number, a.purchase_date, a.warranty_end_date, a.status,
        a.notes, a.qr_code_data, a.created_at,
        asg.assigned_date, asg.handover_notes,
        admin.full_name as assigned_by_name
      FROM assets a
      JOIN assignments asg ON a.id = asg.asset_id AND asg.status = 'aktif'
      LEFT JOIN users admin ON asg.assigned_by_user_id = admin.id
      WHERE a.assigned_to_user_id = ?
      ORDER BY asg.assigned_date DESC
    `).all(req.user.id);

    return res.json({
      success: true,
      data: assets
    });
  } catch (error) {
    console.error('getMyAssets error:', error);
    return res.status(500).json({ success: false, message: 'Kişisel zimmetli cihazlar alınamadı.' });
  }
}

// Get full assignment history & audit logs
async function getAssignmentHistory(req, res) {
  try {
    const { page = 1, limit = 15, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    let params = [];

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      whereClause = `WHERE a.name LIKE ? OR a.asset_code LIKE ? OR u.full_name LIKE ? OR admin.full_name LIKE ?`;
      params.push(s, s, s, s);
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM assignments asg
      JOIN assets a ON asg.asset_id = a.id
      JOIN users u ON asg.user_id = u.id
      LEFT JOIN users admin ON asg.assigned_by_user_id = admin.id
      ${whereClause}
    `;
    const countRes = await db.prepare(countSql).get(...params);
    const totalCount = countRes ? countRes.total : 0;

    const sql = `
      SELECT 
        asg.id, asg.assigned_date, asg.return_date, asg.status, asg.handover_notes, asg.return_notes,
        a.id as asset_id, a.name as asset_name, a.asset_code, a.category as asset_category, a.serial_number,
        u.id as user_id, u.full_name as user_name, u.email as user_email, u.department as user_department,
        admin.full_name as assigned_by_name
      FROM assignments asg
      JOIN assets a ON asg.asset_id = a.id
      JOIN users u ON asg.user_id = u.id
      LEFT JOIN users admin ON asg.assigned_by_user_id = admin.id
      ${whereClause}
      ORDER BY asg.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const history = await db.prepare(sql).all(...params, parseInt(limit), offset);

    return res.json({
      success: true,
      data: history,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getAssignmentHistory error:', error);
    return res.status(500).json({ success: false, message: 'Zimmet geçmişi alınamadı.' });
  }
}

// Get all system audit logs (Sistem Denetim Logları)
async function getSystemAuditLogs(req, res) {
  try {
    const { page = 1, limit = 15, search = '', action = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = [];
    let params = [];

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(l.details LIKE ? OR u.full_name LIKE ? OR a.asset_code LIKE ? OR a.name LIKE ?)');
      params.push(s, s, s, s);
    }

    if (action) {
      whereClauses.push('l.action = ?');
      params.push(action);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN assets a ON l.asset_id = a.id
      ${whereSql}
    `;
    const countRes = await db.prepare(countSql).get(...params);
    const totalCount = countRes ? countRes.total : 0;

    const sql = `
      SELECT 
        l.id, l.action, l.details, l.created_at,
        u.id as user_id, u.full_name as user_name, u.email as user_email,
        a.id as asset_id, a.asset_code, a.name as asset_name
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN assets a ON l.asset_id = a.id
      ${whereSql}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await db.prepare(sql).all(...params, parseInt(limit), offset);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getSystemAuditLogs error:', error);
    return res.status(500).json({ success: false, message: 'Sistem logları alınamadı.' });
  }
}

module.exports = {
  assignAsset,
  returnAsset,
  getMyAssets,
  getAssignmentHistory,
  getSystemAuditLogs
};

