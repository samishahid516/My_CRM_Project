const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const imapService = require('./services/imapService');
const socketService = require('./services/socket');

const app = express();

// Connect to MongoDB Atlas
connectDB();

const server = http.createServer(app);
const io = socketService.init(server);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/emails', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 CRM Email Intelligence API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 ═══════════════════════════════════════════════`);
  console.log(`   CRM Email Intelligence API`);
  console.log(`   Running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`═══════════════════════════════════════════════════\n`);

  // Start real email polling
  imapService.startPolling();
});
