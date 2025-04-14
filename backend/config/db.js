const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable or use fallback
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/buzznet';
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string exists:', !!mongoURI);
    
    // Ensure we're using the buzznet database
    let uriWithDb = mongoURI;
    if (!mongoURI.includes('/buzznet?') && !mongoURI.endsWith('/buzznet')) {
      // Add the database name if not already specified
      uriWithDb = mongoURI.includes('?') 
        ? mongoURI.replace('?', '/buzznet?')
        : `${mongoURI}/buzznet`;
    }
    
    console.log('Using URI with database:', uriWithDb.substring(0, 20) + '...');
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };
    
    const conn = await mongoose.connect(uriWithDb, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process on failed connection, just log the error
    // This is important for serverless environments like Vercel
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB; 