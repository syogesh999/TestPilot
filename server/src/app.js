const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const specRoutes = require('./routes/specRoutes');
const testRoutes = require('./routes/testRoutes');
const runRoutes = require('./routes/runRoutes');

const app = express();

// Security Middlewares
app.use(helmet());

// Production CORS Configuration
const getCorsOrigin = () => {
  if (!config.clientUrl || config.clientUrl === '*') return '*';
  if (config.clientUrl.includes(',')) {
    return config.clientUrl.split(',').map((url) => url.trim());
  }
  return config.clientUrl;
};

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
  },
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    }, 'HTTP Request');
  });
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'testpilot-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: config.env,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId', specRoutes);
app.use('/api/projects/:projectId/tests', testRoutes);
app.use('/api/runs', runRoutes);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
