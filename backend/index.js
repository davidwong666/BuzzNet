console.log('--- backend/index.js starting ---');

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
console.log('Initializing MongoDB connection...');
if (!process.env.MONGO_URI) {
  console.warn('WARNING: MONGO_URI environment variable is not set');
  console.warn('Using default connection string or will attempt to connect to localhost');
}

// Initialize connection but don't wait for it (important for serverless)
connectDB()
  .then((conn) => {
    if (conn) {
      console.log('MongoDB connected successfully');
    } else {
      console.warn('MongoDB connection unsuccessful, but server will continue');
    }
  })
  .catch((err) => {
    console.error('Failed to initialize MongoDB connection:', err);
  });

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'https://buzznet.vercel.app',
  'https://buzznet-api.vercel.app',
  'https://buzznet-xi.vercel.app',
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        process.env.NODE_ENV !== 'production' ||
        !origin ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: '/api: BuzzNet API is running' });
});

// Add debug endpoint for DB connection
app.get('/api/debug/db', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  // Check environment variables
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set',
    MONGO_URI_EXISTS: !!process.env.MONGO_URI,
    MONGO_URI_LENGTH: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    MONGO_URI_SUBSTRING: process.env.MONGO_URI
      ? `${process.env.MONGO_URI.substring(0, 20)}...`
      : 'not available',
  };

  res.json({
    db_status: statusMap[dbStatus] || 'unknown',
    db_readyState: dbStatus,
    environment: envVars,
    server_time: new Date().toISOString(),
    version: require('./package.json').version || 'unknown',
  });
});

// Add root route for debugging
app.get('/', (req, res) => {
  res.json({
    message: 'root: BuzzNet API is running',
    endpoints: {
      api: '/api',
      posts: '/api/posts',
    },
  });
});

// ============================================
// === ERROR HANDLING MIDDLEWARE PLACEMENT ===
// ============================================
// Define the error handling function
const errorHandler = (err, req, res, next) => {
  console.error(`ERROR ===> ${err.message}`);
  // Log stack trace in development for better debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code:
  // Use res.statusCode if it's already set (e.g., by res.status(400) before throwing)
  // Otherwise, use err.statusCode if the error object has one
  // Default to 500 (Internal Server Error)
  const statusCode = res.statusCode >= 400 ? res.statusCode : err.statusCode || 500;

  // Send a structured JSON error response
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    // Only include the stack trace in non-production environments
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Register the error handling middleware with Express
// **** THIS MUST BE AFTER ALL ROUTES (app.use, app.get, etc.) ****
app.use(errorHandler);
// ============================================
// ============================================

// Start server (only for local development, Vercel uses the export)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel serverless functions
// The error handler MUST be registered before this export
module.exports = app;
