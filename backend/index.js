const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

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
  
  res.json({
    db_status: statusMap[dbStatus] || 'unknown',
    mongo_uri_exists: !!process.env.MONGO_URI,
    mongo_uri_length: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0
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
