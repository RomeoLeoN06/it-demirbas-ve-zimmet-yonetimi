const { db } = require('../config/db');

// GET all departments with stats
async function getDepartments(req, res) {
  try {
    const { search = '' } = req.query;
    let whereClause = '';
    let params = [];

    if (search.trim()) {
      whereClause = 'WHERE d.name LIKE ? OR d.description LIKE ?';
      const s = `%${search.trim()}%`;
      params = [s, s];
    }

    const sql = `
      SELECT 
        d.id, d.name, d.description, d.created_at, d.updated_at,
        (SELECT COUNT(*) FROM users u WHERE u.department = d.name) as user_count,
        (SELECT COUNT(a.id) FROM assets a JOIN users u ON a.assigned_to_user_id = u.id WHERE u.department = d.name) as asset_count
      FROM departments d
      ${whereClause}
      ORDER BY d.name ASC
    `;

    const departments = await db.prepare(sql).all(...params);

    return res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('getDepartments error:', error);
    return res.status(500).json({ success: false, message: 'Departmanlar listelenirken hata oluştu.' });
  }
}

// CREATE department
async function createDepartment(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Departman adı zorunludur.' });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const exists = await db.prepare('SELECT id FROM departments WHERE name = ?').get(trimmedName);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Bu isimde bir departman / birim zaten mevcut.' });
    }

    const result = await db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)')
      .run(trimmedName, description ? description.trim() : null);

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'departman_eklendi', `Yeni departman / birim eklendi: ${trimmedName}`);

    const newDep = await db.prepare(`
      SELECT d.*, 0 as user_count, 0 as asset_count
      FROM departments d WHERE d.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Departman başarıyla oluşturuldu.',
      data: newDep
    });
  } catch (error) {
    console.error('createDepartment error:', error);
    return res.status(500).json({ success: false, message: 'Departman oluşturulamadı.' });
  }
}

// UPDATE department
async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Departman adı zorunludur.' });
    }

    const trimmedName = name.trim();
    const existing = await db.prepare('SELECT * FROM departments WHERE id = ?').get(parseInt(id, 10));
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Departman bulunamadı.' });
    }

    // Check duplicate name on another id
    const duplicate = await db.prepare('SELECT id FROM departments WHERE name = ? AND id != ?').get(trimmedName, parseInt(id, 10));
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Bu isimde başka bir departman mevcut.' });
    }

    // If name changed, synchronize existing users' department string
    if (existing.name !== trimmedName) {
      await db.prepare('UPDATE users SET department = ? WHERE department = ?').run(trimmedName, existing.name);
    }

    await db.prepare(`
      UPDATE departments
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(trimmedName, description !== undefined ? description.trim() : existing.description, parseInt(id, 10));

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'departman_guncellendi', `Departman güncellendi: ${existing.name} -> ${trimmedName}`);

    const updated = await db.prepare(`
      SELECT 
        d.id, d.name, d.description, d.created_at, d.updated_at,
        (SELECT COUNT(*) FROM users u WHERE u.department = d.name) as user_count,
        (SELECT COUNT(a.id) FROM assets a JOIN users u ON a.assigned_to_user_id = u.id WHERE u.department = d.name) as asset_count
      FROM departments d
      WHERE d.id = ?
    `).get(parseInt(id, 10));

    return res.json({
      success: true,
      message: 'Departman bilgileri başarıyla güncellendi.',
      data: updated
    });
  } catch (error) {
    console.error('updateDepartment error:', error);
    return res.status(500).json({ success: false, message: 'Departman güncellenemedi.' });
  }
}

// DELETE department
async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    const dep = await db.prepare('SELECT * FROM departments WHERE id = ?').get(parseInt(id, 10));

    if (!dep) {
      return res.status(404).json({ success: false, message: 'Departman bulunamadı.' });
    }

    // Check if users exist in this department
    const userCountRow = await db.prepare('SELECT COUNT(*) as count FROM users WHERE department = ?').get(dep.name);
    if (userCountRow && userCountRow.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu departmana bağlı ${userCountRow.count} adet personel bulunmaktadır. Lütfen önce personellerin departmanlarını değiştiriniz.`
      });
    }

    await db.prepare('DELETE FROM departments WHERE id = ?').run(parseInt(id, 10));

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'departman_silindi', `Departman silindi: ${dep.name}`);

    return res.json({
      success: true,
      message: 'Departman başarıyla silindi.'
    });
  } catch (error) {
    console.error('deleteDepartment error:', error);
    return res.status(500).json({ success: false, message: 'Departman silinemedi.' });
  }
}

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
