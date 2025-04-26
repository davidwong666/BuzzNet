const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Initializing Mongoose connection...');
  try {
    // Retrieve the MongoDB connection string from environment variables
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      // Consider throwing an error even in production if URI is essential
      console.error('FATAL: MONGO_URI environment variable is not set.');
      // Fallback or specific handling might be needed depending on requirements
      // Using a default localhost might be okay for dev, but risky otherwise.
      // For now, we'll let it fail during connect if not set.
    } else {
      console.log('MONGO_URI found, length:', mongoURI.length);
      // Log only a non-sensitive part for confirmation
      console.log(
        'Using URI starting with:',
        mongoURI.substring(0, mongoURI.indexOf('@') > 0 ? mongoURI.indexOf('@') : 20) + '...'
      );
    }

    // Mongoose 6+ defaults useNewUrlParser and useUnifiedTopology to true.
    // You only need to specify options if you want non-default behavior.
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep custom timeouts if needed
      socketTimeoutMS: 45000,
      // dbName: 'buzznet' // Explicitly setting dbName is another option if not in URI
    };

    // Attempt to connect to MongoDB using Mongoose
    // Ensure your MONGO_URI includes '/buzznet' before the '?' options part.
    const conn = await mongoose.connect(mongoURI, options);

    // Log successful connection details
    console.log(`MongoDB Connected via Mongoose: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`); // Should output 'buzznet' if URI is correct
    return conn;
  } catch (error) {
    // Log any connection errors
    console.error(`!!! MONGOOSE CONNECTION ERROR: ${error.message}`);
    // Optional: Log more details in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.error(error); // Log full error object in dev
    }
    // Decide if server should run without DB. Returning null allows index.js to handle.
    return null;
  }
};

module.exports = connectDB;
