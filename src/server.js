/**
 * Express Server
 * Serverless-ready JSON Validator API server.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const validatorRoutes = require('./routes/validatorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_JSON_SIZE = process.env.MAX_JSON_SIZE || '2mb';

// Middleware
app.use(cors());
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', validatorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'serverless-json-validator',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 JSON Validator server running on port ${PORT}`);
    console.log(`📋 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  });
}

module.exports = app;
