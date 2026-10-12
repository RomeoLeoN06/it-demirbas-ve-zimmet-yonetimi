require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite schema
initDb();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for web + mobile dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Sunucu tarafında beklenmeyen bir hata oluştu.'
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
