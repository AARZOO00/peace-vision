// ══════════════════════════════════
//   PEACE VISION — Express Server
// ══════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');
const paymentRoutes = require('./routes/payments');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database ───
connectDB();

// ─── Security Middleware ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // ✅ FIX: unsafe-eval add kiya — inline onclick handlers kaam karenge
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'fonts.googleapis.com', 'js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      frameSrc: ['js.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      // ✅ FIX: Anthropic API allow kiya — AI chat kaam karega
      connectSrc: ["'self'", 'https://api.anthropic.com', 'https://fonts.googleapis.com', 'https://picsum.photos', 'https://images.unsplash.com'],
    },
  },
}));

// ─── CORS ───
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions from this IP, please try again in an hour.' },
});

app.use(limiter);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ───
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Static Files ───
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/contact', strictLimiter, contactRoutes);
app.use('/api/newsletter', strictLimiter, newsletterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// ─── Images API ───
const fs = require('fs');
app.get('/api/images', (req, res) => {
  try {
    const imgDir = path.join(__dirname, '../frontend/images');
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const files = fs.readdirSync(imgDir)
      .filter(f => exts.includes(path.extname(f).toLowerCase()))
      .map(f => `/images/${f}`);
    res.json({ images: files, count: files.length });
  } catch (e) {
    res.json({ images: [], count: 0 });
  }
});

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── Serve Frontend SPA ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message,
  });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n🌿 Peace Vision Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV}`);
  console.log(`   URL:  http://localhost:${PORT}\n`);
});

module.exports = app;