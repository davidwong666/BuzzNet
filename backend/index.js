console.log('--- backend/index.js starting ---');

const express = require('express');
const cors = require('cors');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Loads variables from .env file into process.env
}
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// --- Import Routes ---
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();

// --- Check for essential environment variables ---
if (!process.env.MONGO_URI) {
  console.warn(
    'WARNING: MONGO_URI environment variable is not set. Database connection might fail.'
  );
}
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Authentication will fail.');
}

// --- Connect to Database ---
console.log('Initializing MongoDB connection...');
connectDB()
  .then((conn) => {
    if (conn) {
      console.log('MongoDB connected successfully');
    } else {
      // connectDB function likely handles errors internally or throws them
      console.warn('MongoDB connection attempt finished, check logs for status.');
    }
  })
  .catch((err) => {
    // Catch errors during the initial connection attempt
    console.error('Failed to initialize MongoDB connection:', err.message);
    // Depending on your strategy, you might exit the process
    // process.exit(1);
  });

// --- CORS Configuration ---
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

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests) in dev
      const isAllowed =
        process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// --- Standard Middleware ---
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes); // Mount user routes

// --- Basic API Info Routes ---
app.get('/api', (req, res) => {
  res.json({ message: '/api: BuzzNet API is running' });
});

// --- Debugging Routes ---
app.get('/api/debug/db', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };

  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set',
    MONGO_URI_EXISTS: !!process.env.MONGO_URI,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET, // Check if JWT secret is set
  };

  res.json({
    db_status: statusMap[dbStatus] || 'unknown',
    db_readyState: dbStatus,
    environment: envVars,
    server_time: new Date().toISOString(),
    version: require('./package.json').version || 'unknown',
  });
});

// --- Root Route ---
app.get('/', (req, res) => {
  res.json({
    message: 'root: BuzzNet API is running',
    endpoints: {
      api: '/api',
      posts: '/api/posts',
      users_register: '/api/users/register (POST)', // Add user endpoints info
      users_login: '/api/users/login (POST)', // Add user endpoints info
      debug_db: '/api/debug/db',
    },
  });
});

// ============================================
// === ERROR HANDLING MIDDLEWARE            ===
// ============================================
// Define the error handling function
const errorHandler = (err, req, res, next) => {
  // Log the error internally
  console.error(`ERROR | ${req.method} ${req.originalUrl} | ${err.message}`);
  // Log stack trace in development for better debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code:
  let statusCode = res.statusCode >= 400 ? res.statusCode : 500; // Default to 500 if not set

  // Handle Mongoose Validation Errors specifically for better client feedback
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request for validation issues
    // Extract specific validation messages
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      message: 'Validation Failed',
      errors: messages, // Provide specific field errors
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Handle Mongoose Duplicate Key Errors (e.g., unique email constraint)
  if (err.code && err.code === 11000) {
    statusCode = 400; // Bad Request
    // Extract the field that caused the duplicate error
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(statusCode).json({
      message: `Duplicate field value entered: ${field} '${value}' already exists.`,
      field: field, // Indicate which field was duplicate
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Send a structured JSON error response for other errors
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    // Only include the stack trace in non-production environments
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Register the error handling middleware with Express
// **** THIS MUST BE REGISTERED AFTER ALL OTHER app.use() and routes ****
app.use(errorHandler);
// ============================================
// ============================================

// --- Start Server (for local development) ---
if (require.main === module && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
  });
}

// --- Export the Express API for Serverless Environments (like Vercel) ---
// The error handler MUST be registered before this export
module.exports = app;
