const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'it_demirbas_gizli_anahtar_2026_super_secure';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yetkilendirme jetonu (token) bulunamadı. Lütfen giriş yapın.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş oturum. Lütfen yeniden giriş yapın.' });
    }

    try {
      const user = await db.prepare('SELECT id, full_name, email, role, department, phone, avatar_url, is_active FROM users WHERE id = ?').get(decoded.id);

      if (!user || user.is_active === 0) {
        return res.status(403).json({ success: false, message: 'Kullanıcı hesabı bulunamadı veya pasife alınmış.' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({ success: false, message: 'Veritabanı bağlantı hatası.' });
    }
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bu işlem için Yönetici (Admin) yetkisi gerekmektedir.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
