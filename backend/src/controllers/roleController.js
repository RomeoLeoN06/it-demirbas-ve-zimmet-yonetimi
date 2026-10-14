const { db } = require('../config/db');

// GET all roles with user count
async function getRoles(req, res) {
  try {
    const sql = `
      SELECT 
        r.id, r.name, r.display_name, r.description, r.is_system, r.created_at, r.updated_at,
        (SELECT COUNT(*) FROM users u WHERE u.role = r.name) as user_count
      FROM roles r
      ORDER BY r.is_system DESC, r.display_name ASC
    `;

    const roles = await db.prepare(sql).all();

    return res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('getRoles error:', error);
    return res.status(500).json({ success: false, message: 'Roller listelenirken hata oluştu.' });
  }
}

// CREATE role
async function createRole(req, res) {
  try {
    const { name, display_name, description } = req.body;

    if (!display_name || !display_name.trim()) {
      return res.status(400).json({ success: false, message: 'Rol görünen adı zorunludur.' });
    }

    const trimmedDisplayName = display_name.trim();

    // Generate code name if not explicitly given
    let roleCode = name && name.trim()
      ? name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : trimmedDisplayName
          .toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');

    // Check duplicate
    const exists = await db.prepare('SELECT id FROM roles WHERE name = ? OR display_name = ?').get(roleCode, trimmedDisplayName);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Bu rol kodu veya adı zaten tanımlı.' });
    }

    const result = await db.prepare('INSERT INTO roles (name, display_name, description, is_system) VALUES (?, ?, ?, 0)')
      .run(roleCode, trimmedDisplayName, description ? description.trim() : null);

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'rol_eklendi', `Yeni rol tanımlandı: ${trimmedDisplayName} (${roleCode})`);

    const newRole = await db.prepare(`
      SELECT r.*, 0 as user_count
      FROM roles r WHERE r.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Yeni rol başarıyla eklendi.',
      data: newRole
    });
  } catch (error) {
    console.error('createRole error:', error);
    return res.status(500).json({ success: false, message: 'Rol oluşturulamadı.' });
  }
}

// UPDATE role
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { display_name, description } = req.body;

    if (!display_name || !display_name.trim()) {
      return res.status(400).json({ success: false, message: 'Rol görünen adı zorunludur.' });
    }

    const role = await db.prepare('SELECT * FROM roles WHERE id = ?').get(parseInt(id, 10));
    if (!role) {
      return res.status(404).json({ success: false, message: 'Rol bulunamadı.' });
    }

    const trimmedDisplayName = display_name.trim();

    await db.prepare(`
      UPDATE roles
      SET display_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(trimmedDisplayName, description !== undefined ? description.trim() : role.description, parseInt(id, 10));

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'rol_guncellendi', `Rol güncellendi: ${role.display_name} -> ${trimmedDisplayName}`);

    const updated = await db.prepare(`
      SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role = r.name) as user_count
      FROM roles r WHERE r.id = ?
    `).get(parseInt(id, 10));

    return res.json({
      success: true,
      message: 'Rol başarıyla güncellendi.',
      data: updated
    });
  } catch (error) {
    console.error('updateRole error:', error);
    return res.status(500).json({ success: false, message: 'Rol güncellenemedi.' });
  }
}

// DELETE role
async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const role = await db.prepare('SELECT * FROM roles WHERE id = ?').get(parseInt(id, 10));

    if (!role) {
      return res.status(404).json({ success: false, message: 'Rol bulunamadı.' });
    }

    if (role.is_system === 1) {
      return res.status(400).json({
        success: false,
        message: 'Sistem varsayılan rolleri (Yönetici / Personel) silinemez.'
      });
    }

    // Check if any users have this role
    const userCountRow = await db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get(role.name);
    if (userCountRow && userCountRow.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu role atanmış ${userCountRow.count} adet kullanıcı bulunmaktadır. Lütfen önce bu kullanıcıların rolünü değiştiriniz.`
      });
    }

    await db.prepare('DELETE FROM roles WHERE id = ?').run(parseInt(id, 10));

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'rol_silindi', `Rol silindi: ${role.display_name} (${role.name})`);

    return res.json({
      success: true,
      message: 'Rol başarıyla silindi.'
    });
  } catch (error) {
    console.error('deleteRole error:', error);
    return res.status(500).json({ success: false, message: 'Rol silinemedi.' });
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
