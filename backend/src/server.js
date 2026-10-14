require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const { securityHeaders, apiLimiter, sanitizeInput } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes = require('./routes/roleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Hacker / parmak izi koruması (Express başlığını gizle)
app.disable('x-powered-by');

// Initialize DB schema
initDb();

// HTTP Güvenlik Başlıkları (Helmet: XSS, Clickjacking, MIME-sniff koruması)
app.use(securityHeaders);

// DoS ve aşırı istek önleme (Rate Limiting)
app.use('/api', apiLimiter);

// CORS Yapılandırması
app.use(cors({
  origin: '*', // Mobil APK ve web arayüzü için
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// DoS engelleme amacıyla payload limiti güvenli seviyede tutulur
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Otomatik XSS ve zararlı HTML kod temizleme (Input Sanitization)
app.use(sanitizeInput);

// Request logging in dev
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'IT Demirbaş ve Zimmet Yönetim Sistemi API',
    security: 'Enhanced (Helmet, RateLimit, XSS Filter, Bcrypt, JWT, MSSQL Parametric)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);

// Güvenli Global Error Handler (Veritabanı yapısını veya hassas sunucu detaylarını dışarı sızdırmaz)
app.use((err, req, res, next) => {
  console.error('[GÜVENLİK/SUNUCU HATASI]:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    success: false,
    message: isDev ? (err.message || 'Sunucu hatası') : 'Sunucuda beklenmeyen bir hata oluştu. Güvenlik kaydı oluşturuldu.'
  });
});

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `İstenen uç nokta (${req.originalUrl}) bulunamadı.`
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IT Demirbaş ve Zimmet Yönetim Sistemi API Aktif`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = app;
