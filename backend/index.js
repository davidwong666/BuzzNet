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
connectDB().then(conn => {
  if (conn) {
    console.log('MongoDB connected successfully');
  } else {
    console.warn('MongoDB connection unsuccessful, but server will continue');
  }
}).catch(err => {
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
  'https://buzznet-xi.vercel.app'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins during development
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: 'BuzzNet API is running' });
});

// Add debug endpoint for DB connection
app.get('/api/debug/db', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  // Check environment variables
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set',
    MONGO_URI_EXISTS: !!process.env.MONGO_URI,
    MONGO_URI_LENGTH: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    MONGO_URI_SUBSTRING: process.env.MONGO_URI ? `${process.env.MONGO_URI.substring(0, 20)}...` : 'not available'
  };
  
  res.json({
    db_status: statusMap[dbStatus] || 'unknown',
    db_readyState: dbStatus,
    environment: envVars,
    server_time: new Date().toISOString(),
    version: require('./package.json').version || 'unknown'
  });
});

// Add root route for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'BuzzNet API is running',
    endpoints: {
      api: '/api',
      posts: '/api/posts'
    }
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel serverless functions
module.exports = app;
