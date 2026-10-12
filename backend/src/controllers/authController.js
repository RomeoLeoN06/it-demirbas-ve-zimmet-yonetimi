const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
async function register(req, res) {
  try {
    const { full_name, email, password, department, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Ad Soyad, E-posta ve Şifre alanları zorunludur.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=1e293b&color=38bdf8`;

    const stmt = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, department, phone, avatar_url)
      VALUES (?, ?, ?, 'personnel', ?, ?, ?)
    `);

    const result = stmt.run(
      full_name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      department || 'Genel Personel',
      phone || '',
      defaultAvatar
    );

    const newUser = db.prepare('SELECT id, full_name, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(newUser);

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(newUser.id, 'kayit_olundu', `Yeni personel sisteme kayıt oldu: ${newUser.full_name}`);

    return res.status(201).json({
      success: true,
      message: 'Kayıt işlemi başarıyla tamamlandı.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Kayıt sırasında sunucu hatası oluştu.' });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre zorunludur.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ success: false, message: 'Hesabınız askıya alınmıştır. Lütfen sistem yöneticisiyle iletişime geçin.' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ success: false, message: 'Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yapın veya şifre belirleyin.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(user.id, 'giris_yapildi', `Kullanıcı sisteme giriş yaptı: ${user.email}`);

    return res.json({
      success: true,
      message: 'Giriş başarılı!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Giriş yapılırken bir hata oluştu.' });
  }
}

// Google OAuth Login
async function googleLogin(req, res) {
  try {
    const { email, name, google_id, avatar_url } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google e-posta bilgisi eksik.' });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      // Create user if not exists
      const stmt = db.prepare(`
        INSERT INTO users (full_name, email, role, department, avatar_url, google_id)
        VALUES (?, ?, 'personnel', 'Dijital Dönüşüm', ?, ?)
      `);

      const defaultAvatar = avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Kullanici')}&background=0284c7&color=ffffff`;
      const result = stmt.run(name || email.split('@')[0], email.toLowerCase().trim(), defaultAvatar, google_id || 'google_' + Date.now());

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

      db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
        .run(user.id, 'google_ile_kayit', `Google ile yeni hesap açıldı: ${user.email}`);
    } else {
      // Update google_id if not present
      if (!user.google_id && google_id) {
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(google_id, user.id);
      }
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(user.id, 'google_ile_giris', `Google hesabı ile oturum açıldı: ${user.email}`);

    return res.json({
      success: true,
      message: 'Google ile giriş başarılı!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: 'Google girişi sırasında hata oluştu.' });
  }
}

// Current User Me
async function getMe(req, res) {
  try {
    const user = db.prepare('SELECT id, full_name, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const assignedCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE assigned_to_user_id = ?').get(user.id);

    return res.json({
      success: true,
      user: {
        ...user,
        assigned_asset_count: assignedCount ? assignedCount.count : 0
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Profil bilgisi alınamadı.' });
  }
}

// Update Profile
async function updateProfile(req, res) {
  try {
    const { full_name, department, phone, avatar_url } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Ad Soyad boş bırakılamaz.' });
    }

    db.prepare(`
      UPDATE users
      SET full_name = ?, department = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, department || '', phone || '', avatar_url || '', req.user.id);

    const updatedUser = db.prepare('SELECT id, full_name, email, role, department, phone, avatar_url, updated_at FROM users WHERE id = ?').get(req.user.id);

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'profil_guncellendi', `Profil bilgileri güncellendi: ${full_name}`);

    return res.json({
      success: true,
      message: 'Profiliniz başarıyla güncellendi.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Profil güncellenirken hata oluştu.' });
  }
}

// Change Password
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    if (user.password_hash) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Mevcut şifrenizi girmelisiniz.' });
      }
      const isMatch = bcrypt.compareSync(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mevcut şifreniz hatalı.' });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'sifre_degistirildi', 'Kullanıcı şifresini değiştirdi.');

    return res.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Şifre değiştirilemedi.' });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword
};
