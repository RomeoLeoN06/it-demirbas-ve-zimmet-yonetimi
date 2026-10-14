const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// GET all users
async function getUsers(req, res) {
  try {
    const { search = '', role = '', department = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = [];
    let params = [];

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(full_name LIKE ? OR email LIKE ? OR department LIKE ? OR phone LIKE ?)');
      params.push(s, s, s, s);
    }

    if (role) {
      whereClauses.push('role = ?');
      params.push(role);
    }

    if (department) {
      whereClauses.push('department = ?');
      params.push(department);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM users ${whereSql}`;
    const countRes = await db.prepare(countSql).get(...params);
    const totalCount = countRes ? countRes.total : 0;

    const sql = `
      SELECT 
        u.id, u.full_name, u.email, u.role, u.department, u.phone,
        u.avatar_url, u.is_active, u.created_at,
        (SELECT COUNT(*) FROM assets WHERE assigned_to_user_id = u.id) as assigned_asset_count
      FROM users u
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await db.prepare(sql).all(...params, parseInt(limit), offset);

    return res.json({
      success: true,
      data: users,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Kullanıcılar listelenirken hata oluştu.' });
  }
}

// GET single user
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await db.prepare(`
      SELECT 
        id, full_name, email, role, department, phone, avatar_url, is_active, created_at
      FROM users
      WHERE id = ?
    `).get(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const assignedAssets = await db.prepare(`
      SELECT id, asset_code, name, category, brand, model, serial_number, status
      FROM assets
      WHERE assigned_to_user_id = ?
    `).all(id);

    return res.json({
      success: true,
      data: {
        ...user,
        assigned_assets: assignedAssets
      }
    });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ success: false, message: 'Kullanıcı detayı alınamadı.' });
  }
}

// CREATE user (Admin)
async function createUser(req, res) {
  try {
    const { full_name, email, password, role = 'personnel', department, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Ad Soyad, E-posta ve Şifre zorunludur.' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresiyle kayıtlı kullanıcı zaten var.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=3b82f6&color=ffffff`;

    const stmt = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, department, phone, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run(
      full_name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      role === 'admin' ? 'admin' : 'personnel',
      department || 'Genel',
      phone || '',
      avatar_url
    );

    const newUser = await db.prepare('SELECT id, full_name, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'kullanici_olusturuldu', `Yönetici yeni kullanıcı oluşturdu: ${newUser.full_name} (${newUser.role})`);

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: newUser
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: 'Kullanıcı oluşturulurken hata oluştu.' });
  }
}

// UPDATE user (Admin)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { full_name, role, department, phone, is_active } = req.body;

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    await db.prepare(`
      UPDATE users SET
        full_name = ?, role = ?, department = ?, phone = ?,
        is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name || user.full_name,
      role || user.role,
      department !== undefined ? department : user.department,
      phone !== undefined ? phone : user.phone,
      is_active !== undefined ? is_active : user.is_active,
      id
    );

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'kullanici_guncellendi', `Kullanıcı bilgileri güncellendi: ${user.full_name}`);

    const updated = await db.prepare('SELECT id, full_name, email, role, department, phone, is_active, updated_at FROM users WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi.',
      data: updated
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ success: false, message: 'Kullanıcı güncellenemedi.' });
  }
}

// RESET user password (Admin)
async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(new_password, salt);

    await db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(password_hash, id);

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'sifre_sifirlandi', `Yönetici kullanıcı şifresini sıfırladı. Kullanıcı ID: ${id}`);

    return res.json({
      success: true,
      message: 'Kullanıcı şifresi başarıyla yenilendi.'
    });
  } catch (error) {
    console.error('resetUserPassword error:', error);
    return res.status(500).json({ success: false, message: 'Şifre sıfırlanamadı.' });
  }
}

// DELETE user (Admin)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Kendi hesabınızı silemezsiniz.' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    // Check if user has active assigned assets
    const activeAssets = await db.prepare('SELECT COUNT(*) as count FROM assets WHERE assigned_to_user_id = ?').get(id);
    if (activeAssets.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kullanıcının üzerinde aktif zimmetli ${activeAssets.count} adet demirbaş bulunmaktadır. Önce demirbaşları geri teslim alınız.`
      });
    }

    await db.prepare('DELETE FROM users WHERE id = ?').run(id);

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'kullanici_silindi', `Kullanıcı silindi: ${user.full_name} (${user.email})`);

    return res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi.'
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Kullanıcı silinemedi.' });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser
};
