const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * HTTP Güvenlik Başlıkları (Helmet)
 * Clickjacking, MIME-sniffing, XSS ve bilgi sızıntılarını engeller.
 */
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Vite HMR ve yerel React geliştirme sunucusuyla tam uyum
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // QR Kod ve görsellerin mobil/web tarafından güvenle çekilebilmesi için
  crossOriginEmbedderPolicy: false,
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'sameorigin' }
});

/**
 * Brute-Force Koruması (Kimlik Doğrulama Uç Noktaları)
 * Şifre deneme ve otomatik hacker bot saldırılarını engeller.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 30, // IP başına 15 dakikada maksimum 30 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Güvenlik Uyarısı: Çok fazla istek yapıldı. Güvenliğiniz için lütfen 15 dakika sonra tekrar deneyin (Brute-Force Koruması).'
  }
});

/**
 * Genel DoS / DDoS Önleyici İstek Limiti
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // IP başına 15 dakikada 1000 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Güvenlik Uyarısı: İstek sıklık sınırı aşıldı. Lütfen biraz bekleyin.'
  }
});

/**
 * XSS (Cross-Site Scripting) ve Zararlı HTML Temizleme
 * Kullanıcı girdilerindeki <script>, inline JS ve onload vb. saldırı kodlarını temizler.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>?/gm, (match) => {
      // Tehlikeli etiketleri tamamen kaldır
      if (/iframe|object|embed|svg|link|style/i.test(match)) {
        return '';
      }
      return match;
    });
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

function sanitizeInput(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
}

module.exports = {
  securityHeaders,
  authLimiter,
  apiLimiter,
  sanitizeInput
};
